`

orders
    - Maybe change the contact details in the addres
    - track shipment
    - accept / reject - To do in the verify order even for COD
        - adjust quantity
        - refund amount
    ** - view one
        - view single order
        - filter by date
    - change status
    - reject, if we want, refund to original method
    - ship product after print and all
    - create return order
    - create replacement order
    ** - get order by Id

    returns : Indiviadual product can be rejected to accepted
        - accept return pickup : this accept only to start pickup not final, still product go to QC
        - cancel return : that is after if user call and pickup is not happening or there is delay or the partner is not cooperating
        - change status
            - after QC
        - reject 
            - send rejection mail
        - accept return after QC
            - Create credit note
                - make mailing it to them, a part of it
            - increase quantiy in variant not base

    replacements : Indiviadual product can be rejected to accepted
        - accept return pickup : this accept only to start pickup not final, still product go to QC
        - cancel replacement : that is after if user call and pickup is not happening or there is delay or the partner is not cooperating
        - change status
            - after QC is
        - reject 
            - send rejection mail
        - replacement quantity not avaiable after QC
            - create credit note
                - make mailing it to them, a part of it
        - create order for replacement prodcut
            - increase quantity for size returned
            - decrease quantity for new product
    
    Credit note
        - add new credit node
            - send mail

payments
    - view all
    - view one : redirect to order


credit note
    - view credit note by orderId ( there can be multiple, if user return in batches )
    - view transactions

RETURNS
    - remove status column from returnItem 





Item 1 1,500 X
Item 2 1,500 X
Item 3 7,000

Order 10,000

CN 4,000

Paid                             = 6,000
CN                               = 4,000
Reject                           = 3,000


New order value = Total - Reject = 7,000
Should pay      = 7,000 - 4,000  = 3,000

Order = 3,500 + 3,500
CN = 4000
Cancel = 3,500

new order = 3500 - 4000


if( new order > CN )
    return = paid - new order + CN
    CN = 0
if( new order < CN)
    return = all
    CN = CN - new order
if( CN == new order)
    return = all
    CN = 0


3500
2900 X
3200

Order = 9600
cn    = 3100
paid  = 6500

new order = 9600 - 2900 = 6700

    return = 6500 - 6700 + 3100 = 2900
    CN = 0


3500
2900 
5200 X

Order = 11600
cn    =  7200
paid  =  4400

new order = Order - Cancel = 6400
    CN > new order
        return = all = 4400
        CN = 800

`