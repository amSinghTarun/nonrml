import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
      // Parse the request body
      const body = await request.json();
      console.log(body)
      // Validate required fields
        return NextResponse.json(
            {
                "addresses": [
                  {
                    "id": "0",
                    "zipcode": "560000",
                    "state_code": "KA",
                    "country": "IN",
                    "shipping_methods": [
                      {
                        "id": "1",
                        "description": "Free shipping",
                        "name": "Delivery within 5 days",
                        "serviceable": true,
                        "shipping_fee": 1000, // in paise. Here 1000 = 1000 paise, which equals to ₹10
                        "cod": true,
                        "cod_fee": 1000 // in paise. Here 1000 = 1000 paise, which equals to ₹10
                      },
                      {
                        "id": "2",
                        "description": "Standard Delivery",
                        "name": "Delivered on the same day",
                        "serviceable": true,
                        "shipping_fee": 1000, // in paise. Here 1000 = 1000 paise, which equals to ₹10
                        "cod": false,
                        "cod_fee": 0 // in paise. Here 1000 = 1000 paise, which equals to ₹10
                      }
                    ]
                  }
                ]
            }, { status: 201 }
        )
  
    } catch (error) {
      console.error('Shipping API error:', error)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error' 
        },
        { status: 500 }
      )
    }
}

export async function OPTIONS(request: NextRequest) {
return new NextResponse(null, {
    status: 200,
    headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
})
}
