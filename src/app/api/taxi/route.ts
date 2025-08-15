const GET = async (request: Request) => {
  const { url } = request;
  const { searchParams } = new URL(url);
  const phone = searchParams.get("phone");

  if (phone) {
    return new Response(phone, { status: 200 });
  }

  return new Response("no phone param", { status: 400 });
};

export { GET };
