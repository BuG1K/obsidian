export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  console.log(phone);
  if (phone) {
    return new Response(phone, { status: 200 });
  }

  return new Response("no phone param", { status: 400 });
}
