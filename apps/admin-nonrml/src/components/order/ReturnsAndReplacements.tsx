/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShiprocketShipping, ShiprocketTypes } from "@nonrml/shipping";
import { Loader2 } from "lucide-react";
import { RouterOutput, trpc } from "@/app/_trpc/client";
import { useReturnManagement } from "./hooks/useReturnManagement";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import { prismaEnums } from "@nonrml/prisma";
import {$Enums as prismaEnums } from "@prisma/client";

const RETURN_STATUS = [
  "PENDING",
  "ASSESSED",
  "IN_TRANSIT",
  "RECEIVED",
  "ALLOWED",
  "CANCELLED",
  "CANCELLED_ADMIN",
] as const;
type ReturnStatus = (typeof RETURN_STATUS)[number];

interface ReturnsAndReplacementsProps {
  order: RouterOutput["viewer"]["orders"]["getOrder"]["data"];
  orderId: number;
  returnDetails:
    | RouterOutput["viewer"]["orders"]["getOrderReturnDetails"]["data"]
    | undefined;
  isLoading: boolean;
  onReturnUpdated: () => void;
}

const ReturnsAndReplacements: React.FC<ReturnsAndReplacementsProps> = ({
  order,
  returnDetails,
  isLoading,
  onReturnUpdated,
}) => {
  const { handleReplacementOrderStatusChange } = useReturnManagement();

  // TRPC mutations
  const editReturnMutation = trpc.viewer.return.editReturn.useMutation();
  const updateNonRepMutation =
    trpc.viewer.replacement.updateNonReplaceQuantity.useMutation();
  const finalizeReplacementMutation =
    trpc.viewer.replacement.finaliseReturnAndMarkReplacementOrder.useMutation();
  const issueRefundMutation =
    trpc.viewer.payment.issueReturnReplacementBankRefund.useMutation();
  const createCreditNoteMutation =
    trpc.viewer.creditNotes.createCreditNote.useMutation();
  const editReplacementOrderMutation =
    trpc.viewer.replacement.editReplacementOrder.useMutation();

  // UI state - shipping dialog (mimic OrderActionsPanel)
  const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
  const [isShipping, setIsShipping] = useState(false);
  const [length, setLength] = useState<number>(10);
  const [breadth, setBreadth] = useState<number>(10);
  const [height, setHeight] = useState<number>(5);
  const [weight, setWeight] = useState<number>(0.5);
  // Which replacement we are shipping right now
  const [shipContext, setShipContext] = useState<{
    replacementOrderId: number;
    returnItems: any[];
    replacementShipmentId?: string | null;
  } | null>(null);

  // Change-status modal state (return)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusTargetReturn, setStatusTargetReturn] = useState<any>(null);
  const [nextStatus, setNextStatus] = useState<ReturnStatus>("PENDING");
  const [reviewData, setReviewData] = useState<Record<
    string,
    { rejectedQuantity: number; rejectReason: string }
  >>({});

  // Non-replaceable edits inline
  const [nonRepEdits, setNonRepEdits] = useState<
    Record<number, number | undefined>
  >({});

  // Finalize dialog
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);
  const [finalizeTargetReturn, setFinalizeTargetReturn] = useState<any>(null);
  const [finalizeReviewData, setFinalizeReviewData] = useState<Record<
    string,
    { rejectedQuantity: number; rejectReason: string }
  >>({});

  // Credit note “extra amount”
  const [extraAmountMap, setExtraAmountMap] = useState<
    Record<number, number | undefined>
  >({});

  // Replacement status editor map
  const [replacementStatusMap, setReplacementStatusMap] = useState<
    Record<number, keyof typeof prismaEnums.ReplacementOrderStatus | "">
  >({});
  const replacementStatusOptions = Object.keys(
    prismaEnums.ReplacementOrderStatus
  ) as Array<keyof typeof prismaEnums.ReplacementOrderStatus>;

  const hasItemsToReplace = (returnOrder: any) => {
    if (returnOrder.returnType !== "REPLACEMENT" || !returnOrder.returnItems) { return true; }

    const totalReplaceableQuantity = returnOrder.returnItems.reduce( (total: number, item: any) => {
      const returnQuantity = item.quantity || 0;
      const rejectedQuantity = item.rejectedQuantity || 0;
      const nonReplaceableQuantity = item.ReplacementItem?.nonReplacableQuantity || 0;
      console.log(returnQuantity - rejectedQuantity - nonReplaceableQuantity)
      return ( total + Math.max(0, returnQuantity - rejectedQuantity - nonReplaceableQuantity) );
    }, 0);

    console.log(totalReplaceableQuantity);
    return totalReplaceableQuantity > 0;
  };

  const hasNonReplaceable = (ret: any) =>
    Array.isArray(ret.returnItems) &&
    ret.returnItems.some(
      (ri: any) => (ri.ReplacementItem?.nonReplacableQuantity ?? 0) > 0
    );

  const replaceQuantityRemaining = (ret: any) => {
    if (!Array.isArray(ret.returnItems)) return 0;
    return ret.returnItems.reduce((total: number, ri: any) => {
      const q = ri.quantity ?? 0;
      const rej = ri.rejectedQuantity ?? 0;
      const nonrep = ri.ReplacementItem?.nonReplacableQuantity ?? 0;
      const action = ri.ReplacementItem?.nonReplacableAction ?? null;
      if (nonrep > 0 && action !== "credited") {
        return total + Math.max(q - (rej + nonrep), 0);
      }
      return total;
    }, 0);
  };

  // Return status dialog open
  const openStatusDialog = (ret: any, suggested?: ReturnStatus) => {
    setStatusTargetReturn(ret);
    setNextStatus(suggested || ret.returnStatus || "PENDING");
    const initial: Record<
      string,
      { rejectedQuantity: number; rejectReason: string }
    > = {};
    (ret.returnItems || []).forEach((ri: any) => {
      initial[String(ri.id)] = {
        rejectedQuantity: ri.rejectedQuantity ?? 0,
        rejectReason: ri.rejectReason ?? "",
      };
    });
    setReviewData(initial);
    setStatusDialogOpen(true);
  };

  const submitStatusChange = async () => {
    if (!statusTargetReturn) return;
    try {
      await editReturnMutation.mutateAsync({
        returnId: Number(statusTargetReturn.id),
        returnStatus: nextStatus,
        ...(nextStatus === "ASSESSED" &&
        Object.values(reviewData || {}).some((v) => (v.rejectedQuantity ?? 0) > 0)
          ? { reviewData }
          : {}),
      } as any);
      setStatusDialogOpen(false);
      setStatusTargetReturn(null);
      onReturnUpdated?.();
    } catch (err: any) {
      alert(
        err?.message ||
          "Failed to update return status. Please verify inputs and try again."
      );
    }
  };

  // Hide ASSESSED from change-status options
  const statusOptionsFor = (current: ReturnStatus): ReturnStatus[] => {
    const flow: Record<ReturnStatus, ReturnStatus[]> = {
      PENDING: ["IN_TRANSIT", "RECEIVED", "CANCELLED", "CANCELLED_ADMIN"],
      ASSESSED: ["IN_TRANSIT", "RECEIVED", "CANCELLED", "CANCELLED_ADMIN"],
      IN_TRANSIT: ["RECEIVED", "CANCELLED", "CANCELLED_ADMIN"],
      RECEIVED: ["CANCELLED", "CANCELLED_ADMIN"],
      ALLOWED: [],
      CANCELLED: [],
      CANCELLED_ADMIN: [],
    };
    return (flow[current] || []).filter((s) => s !== "ASSESSED");
  };

  // Finalize flow
  const openFinalizeDialog = (ret: any) => {
    setFinalizeTargetReturn(ret);
    const initial: Record<
      string,
      { rejectedQuantity: number; rejectReason: string }
    > = {};
    (ret.returnItems || []).forEach((ri: any) => {
      initial[String(ri.id)] = {
        rejectedQuantity: ri.rejectedQuantity ?? 0,
        rejectReason: ri.rejectReason ?? "",
      };
    });
    setFinalizeReviewData(initial);
    setFinalizeDialogOpen(true);
  };

  const submitFinalize = async () => {
    if (!finalizeTargetReturn?.ReplacementOrder?.id) {
      alert("No Replacement Order found for this return.");
      return;
    }
    try {
      await finalizeReplacementMutation.mutateAsync({
        replacementOrderId: Number(finalizeTargetReturn.ReplacementOrder.id),
        reviewData: finalizeReviewData,
      } as any);
      setFinalizeDialogOpen(false);
      setFinalizeTargetReturn(null);
      onReturnUpdated?.();
    } catch (e: any) {
      alert(e?.message || "Failed to finalize return.");
    }
  };

  // Ship Replacement — mimicking OrderActionsPanel behavior
  const handleShipReplacement = async () => {
    if (!shipContext) return;
    try {
      setIsShipping(true);

      if (!order?.address) {
        alert("Missing order address.");
        return;
      }

      let subtotal = 0;
      const items = (shipContext.returnItems || []).map((item: any) => {
        const matched = order.orderProducts.find(
          (p) => p.id === item.orderProductId
        );
        if (!matched?.price) {
          throw new Error(
            `Variant ${matched?.productVariantId} has no price`
          );
        }
        const units = item.quantity || 1;
        subtotal += matched.price * units;

        return {
          name:
            item.productVariant?.product?.name,
          sku:
            item.productVariant?.product?.sku,
          units,
          sellingPrice: matched.price,
        };
      });

      const shiprocketOrder: ShiprocketTypes.OrderData = {
        orderId: `REPL-${shipContext.replacementOrderId}`,
        orderDate: new Date().toISOString(),
        pickupLocation: "Primary",
        billing: {
          customerName: order.address.contactName,
          address: order.address.location,
          city: order.address.city,
          pincode: Number(order.address.pincode),
          state: order.address.state,
          country: "India",
          email: order.email,
          phone: Number(
            String(order.address.contactNumber).replace(/\D/g, "").slice(-10)
          ),
        },
        shippingIsBilling: true,
        orderItems: items,
        paymentMethod: "Prepaid",
        subTotal: subtotal,
        dimensions: { length, breadth, height },
        weight,
      };

      const response =
        await ShiprocketShipping.ShiprocketShipping.createOrder(
          shiprocketOrder
        );

      if (response.success) {
        alert(`Shipment Created! Order ID: ${response.orderId}`);
        // Optionally update replacement order status to SHIPPED
        // await editReplacementOrderMutation.mutateAsync({
        //   replacementId: shipContext.replacementOrderId,
        //   replacementStatus: "SHIPPED",
        // } as any);

        onReturnUpdated?.();
      } else {
        alert(`Failed to create shipment: ${response.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating shipment:", err);
      alert("Something went wrong while creating shipment.");
    } finally {
      setIsShipping(false);
      setIsShipDialogOpen(false);
      setShipContext(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading return details...</span>
      </Card>
    );
  }
  if (!returnDetails || returnDetails.length === 0) return null;

  return (
    <Accordion type="single" collapsible className="w-full p-1">
      <AccordionItem value="returns">
        <AccordionTrigger>
          <CardTitle>Returns & Replacements</CardTitle>
        </AccordionTrigger>
        <AccordionContent>
          {returnDetails.map((ret) => {
            const anyNonReplaceable = hasNonReplaceable(ret);
            const replaceRem = replaceQuantityRemaining(ret);
            const refundShouldBeDisabled =
              (!!ret.ReplacementOrder &&
                ret.returnStatus == prismaEnums.ReturnStatus.ASSESSED &&
                replaceRem == 0) || issueRefundMutation.isLoading;

            const replacementId = ret.ReplacementOrder?.id as
              | number
              | undefined;
            const extraAmount =
              (replacementId && extraAmountMap[replacementId]) ?? 0;

            return (
              <Card key={ret.id} className="mb-4">
                <CardHeader className="space-y-3">
                  {/* Meta */}
                  <div className="text-xs text-neutral-700 flex flex-wrap gap-x-4 gap-y-1 items-center">
                    <span>
                      Return ID: <b>{ret.id}</b>
                    </span>
                    <span>
                      Created:{" "}
                      <b>{new Date(ret.createdAt).toLocaleString()}</b>
                    </span>
                    <span>
                      Type: <b>{ret.returnType}</b>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-neutral-900 text-white text-[10px] tracking-wide">
                      STATUS: {ret.returnStatus}
                    </span>
                    {ret.returnShipmentId && (
                      <span>
                        Return Shipment: <b>{ret.returnShipmentId}</b>
                      </span>
                    )}
                    {ret.ReplacementOrder && (
                      <span>
                        Replacement Order: <b>{ret.ReplacementOrder.id}</b> •{" "}
                        <b className="uppercase">
                          {ret.ReplacementOrder.status}
                        </b>
                        {ret.ReplacementOrder.shipmentId
                          ? ` • Shipment: ${ret.ReplacementOrder.shipmentId}`
                          : ""}
                      </span>
                    )}
                  </div>

                  {/* Returned Items */}
                  {Array.isArray(ret.returnItems) && ret.returnItems.length > 0 && (
                    <div className="rounded border p-3">
                      <div className="text-sm font-semibold mb-2">
                        Returned Items
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {ret.returnItems.map((ri: any) => {
                          const qty = ri.quantity ?? 0;
                          const rejected = ri.rejectedQuantity ?? 0;
                          const nonRepQty =
                            ri.ReplacementItem?.nonReplacableQuantity ?? 0;
                          const decision =
                            ri.ReplacementItem?.nonReplaceAction ?? null;
                          const size =
                            ri?.productVariant?.size ??
                            ri?.ReplacementItem?.productVariant?.size ??
                            "-";

                          const currentEdit =
                            nonRepEdits[ri.id] ?? nonRepQty ?? 0;

                          return (
                            <div
                              key={ri.id}
                              className="rounded border p-2 text-xs"
                            >
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-y-1 items-center">
                                <span className="text-neutral-600">
                                  Item ID:
                                </span>
                                <span>#{ri.id}</span>

                                <span className="text-neutral-600">Size:</span>
                                <span>{size}</span>

                                <span className="text-neutral-600">
                                  Returned Qty:
                                </span>
                                <span>{qty}</span>

                                <span className="text-neutral-600">
                                  Rejected Qty:
                                </span>
                                <span>{rejected}</span>

                                <span className="text-neutral-600">
                                  Non‑replaceable:
                                </span>
                                <div className="flex items-center gap-2">
                                  {ret.returnStatus ===
                                  prismaEnums.ReturnStatus.ASSESSED ? (
                                    <Input
                                      type="number"
                                      min={0}
                                      max={Math.max(0, qty - rejected)}
                                      value={currentEdit}
                                      onChange={(e) =>
                                        setNonRepEdits((prev) => ({
                                          ...prev,
                                          [ri.id]: Number(e.target.value),
                                        }))
                                      }
                                      className="h-7 w-24"
                                    />
                                  ) : (
                                    <span>{nonRepQty}</span>
                                  )}
                                  {decision &&
                                    ret.returnStatus !==
                                      prismaEnums.ReturnStatus.ASSESSED && (
                                      <span className="uppercase text-[11px] text-neutral-500">
                                        ({decision})
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Save non-replaceables (only when ASSESSED) */}
                      { ret.returnStatus === prismaEnums.ReturnStatus.ASSESSED && (
                        <div className="flex justify-end pt-2">
                          <Button
                            size="sm"
                            disabled={updateNonRepMutation.isLoading}
                            onClick={async () => {
                              const tasks: Promise<any>[] = [];
                              (ret.returnItems || []).forEach((ri: any) => {
                                const edited = nonRepEdits[ri.id];
                                const replacementItemId =
                                  ri.ReplacementItem?.id;
                                if (
                                  replacementItemId &&
                                  edited !== undefined &&
                                  edited !==
                                    (ri.ReplacementItem?.nonReplacableQuantity ??
                                      0)
                                ) {
                                  tasks.push(
                                    updateNonRepMutation.mutateAsync({
                                      replacementOrderProductId: Number(
                                        replacementItemId
                                      ),
                                      nonReplacementQuantity: Number(edited),
                                    })
                                  );
                                }
                              });

                              if (tasks.length === 0) {
                                alert("No changes to save.");
                                return;
                              }

                              try {
                                await Promise.allSettled(tasks);
                                alert("Non-replaceable quantities updated.");
                                onReturnUpdated?.();
                              } catch (e: any) {
                                alert(
                                  e?.message ||
                                    "Failed to update one or more items. Please retry."
                                );
                              }
                            }}
                          >
                            {updateNonRepMutation.isLoading
                              ? "Saving..."
                              : "Save Non‑replaceable"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex flex-wrap justify-end gap-3 items-start">
                      {/* Change Status (Return) */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          openStatusDialog(
                            ret,
                            (statusOptionsFor(
                              ret.returnStatus as ReturnStatus
                            )[0] as ReturnStatus) ||
                              (ret.returnStatus as ReturnStatus)
                          )
                        }
                      >
                        Change Status
                      </Button>

                      {/* Finalize Return & Initiate Replacement */}
                      {ret.returnStatus === "RECEIVED" &&
                        ret.ReplacementOrder && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openFinalizeDialog(ret)}
                          >
                            Finalize Return & Initiate Replacement
                          </Button>
                        )}

                      {/* Ship Replacement (OrderActionsPanel mimic with dialog) */}
                      {ret.returnStatus === prismaEnums.ReturnStatus.ASSESSED &&
                        ret.ReplacementOrder &&
                        ret.ReplacementOrder.status == prismaEnums.ReplacementOrderStatus.PROCESSING &&
                        hasItemsToReplace(ret) && (
                          <AlertDialog
                            open={
                              isShipDialogOpen &&
                              shipContext?.replacementOrderId ===
                                ret.ReplacementOrder.id
                            }
                            onOpenChange={(open) => {
                              setIsShipDialogOpen(open);
                              if (!open) setShipContext(null);
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                disabled={
                                  isShipping ||
                                  !!ret.ReplacementOrder.shipmentId
                                }
                                onClick={() => {
                                  setShipContext({
                                    replacementOrderId: ret.ReplacementOrder?.id!,
                                    returnItems: ret.returnItems || [],
                                    // replacementShipmentId: ret.ReplacementOrder?.shipmentId!,
                                  });
                                  setIsShipDialogOpen(true);
                                }}
                              >
                                {ret.ReplacementOrder.shipmentId
                                  ? "Shipped"
                                  : "Ship Replacement"}
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Enter Package Details
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Please provide the package dimensions and
                                  weight before shipping.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <label className="text-xs text-neutral-600">
                                Length (cm)
                              </label>
                              <input
                                type="number"
                                aria-label="Length in centimeters"
                                min={0}
                                value={length}
                                onChange={(e) =>
                                  setLength(Number(e.target.value))
                                }
                                className="border p-1 rounded"
                              />

                              <label className="text-xs text-neutral-600">
                                Breadth (cm)
                              </label>
                              <input
                                type="number"
                                aria-label="Breadth in centimeters"
                                min={0}
                                value={breadth}
                                onChange={(e) =>
                                  setBreadth(Number(e.target.value))
                                }
                                className="border p-1 rounded"
                              />

                              <label className="text-xs text-neutral-600">
                                Height (cm)
                              </label>
                              <input
                                type="number"
                                aria-label="Height in centimeters"
                                min={0}
                                value={height}
                                onChange={(e) =>
                                  setHeight(Number(e.target.value))
                                }
                                className="border p-1 rounded"
                              />

                              <label className="text-xs text-neutral-600">
                                Weight (kg)
                              </label>
                              <input
                                type="number"
                                aria-label="Weight in kilograms"
                                min={0}
                                value={weight}
                                onChange={(e) =>
                                  setWeight(Number(e.target.value))
                                }
                                className="border p-1 rounded"
                              />

                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={isShipping}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleShipReplacement}
                                  disabled={
                                    isShipping ||
                                    !!ret.ReplacementOrder.shipmentId
                                  }
                                >
                                  {isShipping
                                    ? "Creating Shipment..."
                                    : "Confirm & Ship"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                      {/* Initiate Refund for Non‑replaceable */}
                      {ret.ReplacementOrder && anyNonReplaceable && (
                        <div className="flex flex-col items-end gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={
                              (!!ret.ReplacementOrder &&
                                ret.returnStatus ==
                                  prismaEnums.ReturnStatus.ASSESSED &&
                                replaceRem == 0) ||
                              issueRefundMutation.isLoading
                            }
                            onClick={async () => {
                              try {
                                await issueRefundMutation.mutateAsync({
                                  replacementOrderId: Number(
                                    ret.ReplacementOrder?.id
                                  ),
                                } as any);
                                alert("Refund initiation successful.");
                                onReturnUpdated?.();
                              } catch (e: any) {
                                alert(
                                  e?.message || "Failed to initiate refund."
                                );
                              }
                            }}
                            title={
                              (!!ret.ReplacementOrder &&
                                ret.returnStatus ==
                                  prismaEnums.ReturnStatus.ASSESSED &&
                                replaceRem == 0)
                                ? "Refund disabled: order already assessed and no replace quantity remains"
                                : undefined
                            }
                          >
                            {issueRefundMutation.isLoading
                              ? "Initiating Refund..."
                              : "Initiate Refund for Non‑replaceable"}
                          </Button>
                          <p className="text-[11px] text-amber-600 text-right max-w-xs">
                            Warning: Use only once, right before shipment.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Create Credit Note */}
                    {ret.ReplacementOrder && (
                      <div className="flex items-end justify-end gap-2 border rounded p-2">
                        <div className="flex flex-col">
                          <label className="text-xs text-neutral-600">
                            Extra Amount (optional)
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={extraAmount}
                            onChange={(e) =>
                              setExtraAmountMap((prev) => ({
                                ...prev,
                                [ret.ReplacementOrder!.id]: Number(
                                  e.target.value
                                ),
                              }))
                            }
                            className="h-8 w-40"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={createCreditNoteMutation.isLoading}
                          onClick={async () => {
                            try {
                              await createCreditNoteMutation.mutateAsync({
                                replacementOrderId: Number(
                                  ret.ReplacementOrder!.id
                                ),
                                ...(extraAmount
                                  ? { extraAmount: Number(extraAmount) }
                                  : {}),
                              } as any);
                              alert("Credit note created.");
                              onReturnUpdated?.();
                            } catch (e: any) {
                              alert(
                                e?.message ||
                                  "Failed to create credit note for replacement order."
                              );
                            }
                          }}
                        >
                          {createCreditNoteMutation.isLoading
                            ? "Creating Credit Note..."
                            : "Create Credit Note"}
                        </Button>
                      </div>
                    )}

                    {/* Change Replacement Status (visible after return is ASSESSED) */}
                    {ret.returnStatus === prismaEnums.ReturnStatus.ASSESSED &&
                      ret.ReplacementOrder && (
                        <div className="flex items-end justify-end gap-2 border rounded p-2">
                          <div className="flex flex-col">
                            <label className="text-xs text-neutral-600">
                              Replacement Status
                            </label>
                            <select
                              className="border rounded px-2 py-1 text-sm h-8"
                              value={
                                replacementStatusMap[ret.ReplacementOrder.id] ??
                                (ret.ReplacementOrder.status as keyof typeof prismaEnums.ReplacementOrderStatus)
                              }
                              onChange={(e) =>
                                setReplacementStatusMap((prev) => ({
                                  ...prev,
                                  [ret.ReplacementOrder!.id]:
                                    e.target.value as keyof typeof prismaEnums.ReplacementOrderStatus,
                                }))
                              }
                            >
                              {replacementStatusOptions.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={editReplacementOrderMutation.isLoading}
                            onClick={async () => {
                              const target =
                                replacementStatusMap[
                                  ret.ReplacementOrder!.id
                                ] ||
                                (ret.ReplacementOrder!
                                  .status as keyof typeof prismaEnums.ReplacementOrderStatus);

                              try {
                                await editReplacementOrderMutation.mutateAsync({
                                  replacementId: Number(ret.ReplacementOrder!.id),
                                  replacementStatus: target,
                                } as any);
                                alert("Replacement status updated.");
                                onReturnUpdated?.();
                              } catch (e: any) {
                                alert(
                                  e?.message ||
                                    "Failed to update replacement status."
                                );
                              }
                            }}
                          >
                            {editReplacementOrderMutation.isLoading
                              ? "Updating..."
                              : "Update"}
                          </Button>
                        </div>
                      )}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ReturnsAndReplacements;