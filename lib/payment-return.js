export const attemptIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function paymentReturn(request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  const location = attemptIdPattern.test(id) ? '/?result=' + id : '/';
  return new Response(null, {
    status: 303,
    headers: {'Location':location, 'Cache-Control':'no-store'}
  });
}
