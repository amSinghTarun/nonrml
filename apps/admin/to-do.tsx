`

orders
    - accept / reject - To do in the verify order even for COD
        - adjust quantity
        - refund amount
        - If user cancel COD, increase the quantity
    - view
        - view single order
        - filter by date
    - change status
    - reject, if we want, refund to original method


address
    - view all


payments
    - view all
    - view one : redirect to order


credit note
    - add new credit node
        - send mail
    - view credit note for user
    - view all credit note
    - view single credit note
        - view transactions


returns : Indiviadual product can be rejected to accepted
    - accept return pickup : this accept only to start pickup not final, still product go to QC
    - change status
        - after QC
    - reject 
        - send rejection mail
    - accept return after QC
        - release credit note
        - increase quantiy in variant not base


replacements : Indiviadual product can be rejected to accepted
    - accept return pickup : this accept only to start pickup not final, still product go to QC
    - change status
        - after QC is
    - reject 
        - send rejection mail
    - replacement quantity not avaiable after QC
        - release credit note
    - create order for exchange prodcut


products
    - add new
    - delete products
    - view product
        - product variants
            - add new
            - increase quantity
            - delete sku
        - link inventory product
        - inventory product 
            - view : redirect
        - upload new image
        - edit 
            - exclusive
            - details
            - description
            - care
            - quantity
            - name
            - photo order
            - sold out


Inventory product
    - view
        - delete
            - can't delete if linked
        - edit 
        - see links
        - delete link
        - dont' link to product from here
    - add new
    - link to products
        - one can be linked to multiple products as 2 type of black t-shirt can be used for 1 product


`