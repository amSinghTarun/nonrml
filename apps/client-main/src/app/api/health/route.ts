// AppRunner health check api
export async function GET(request: Request) {
    const responseStatus = [
      { status: "ok" }
    ];
    return new Response(JSON.stringify(responseStatus), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
}