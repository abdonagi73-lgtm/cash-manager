export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const SCRIPT_URL = process.env.SCRIPT_URL;

  const url = new URL(SCRIPT_URL);
  searchParams.forEach((value, key) => url.searchParams.set(key, value));

  try {
    const response = await fetch(url.toString(), {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
