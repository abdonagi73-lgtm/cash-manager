export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const SCRIPT_URL = process.env.SCRIPT_URL;

  if (!SCRIPT_URL) {
    return Response.json({ error: 'SCRIPT_URL not configured' }, { status: 500 });
  }

  const url = new URL(SCRIPT_URL);
  searchParams.forEach((value, key) => url.searchParams.set(key, value));

  try {
    const response = await fetch(url.toString());
    const text = await response.text();
    const data = JSON.parse(text);
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
} 
