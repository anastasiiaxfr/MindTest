import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { score } from '../../../lib/scoring.js';
import { tests } from '../../../lib/tests.js';

export const dynamic = 'force-dynamic';
const reply = (body, status = 200) => Response.json(body, {status, headers: {'Cache-Control':'no-store'}});
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const secret = () => process.env.WAYFORPAY_MERCHANT_SECRET;
const merchant = () => process.env.WAYFORPAY_MERCHANT_ACCOUNT;
const sign = (...fields) => createHmac('md5', secret()).update(fields.map(v => v ?? '').join(';')).digest('hex');
const db = () => neon(process.env.DATABASE_URL);
const ready = () => Boolean(secret() && merchant() && process.env.APP_URL);

function paymentReturn(request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  return new Response(null, {status:303, headers:{Location:uuid.test(id) ? '/?result=' + id : '/'}});
}

export async function GET(request, {params}) {
  const {action} = await params;
  if (action === 'return') return paymentReturn(request);
  const id = new URL(request.url).searchParams.get('id') || '';
  if (action !== 'result' || !uuid.test(id)) return reply({error:'Result not found.'}, 404);
  try {
    const sql = db();
    const [row] = await sql`SELECT test, payment_status, paid_at, CASE WHEN paid_at IS NOT NULL THEN result END AS result FROM mindtest_attempts WHERE id = ${id}`;
    return row ? reply(row) : reply({error:'Result not found.'},404);
  } catch {
    return reply({error:'Results are temporarily unavailable.'}, 503);
  }
}

export async function POST(request, {params}) {
  const {action} = await params;
  if (action === 'return') return paymentReturn(request);
  if (!['checkout','payment'].includes(action)) return reply({error:'Not found.'},404);
  if (!ready()) return reply({error:'WayForPay is not configured yet.'},503);
  try {
    const data = await request.json();
    const sql = db();
    if (action === 'checkout') {
      const {test, answers, attempt} = data;
      if (typeof test !== 'string' || !Object.hasOwn(tests, test) || typeof attempt !== 'string' || !uuid.test(attempt)) return reply({error:'Invalid attempt.'},400);
      const result = score(test, answers);
      if (!result) return reply({error:'Complete each question first.'},400);
      const origin = new URL(process.env.APP_URL);
      const product = 'MindTest ' + tests[test].title + ' result';
      const account = merchant(), domain = origin.hostname;
      await sql`INSERT INTO mindtest_attempts (id,test,result) VALUES (${attempt},${test},${JSON.stringify(result)}::jsonb) ON CONFLICT (id) DO NOTHING`;
      const [row] = await sql`SELECT test, paid_at, created_at FROM mindtest_attempts WHERE id = ${attempt}`;
      if (row.test !== test) return reply({error:'Attempt already exists.'},409);
      if (row.paid_at) return reply({resultUrl:'/?result=' + attempt});
      const date = Math.floor(new Date(row.created_at).getTime() / 1000);
      return reply({fields:{
        merchantAccount:account, merchantDomainName:domain, merchantAuthType:'simpleSignature',
        merchantTransactionSecureType:'AUTO', merchantTransactionType:'SALE',
        merchantSignature:sign(account,domain,attempt,date,1,'USD',product,1,1),
        orderReference:attempt, orderDate:date, amount:1, currency:'USD',
        'productName[]':product, 'productCount[]':1, 'productPrice[]':1,
        serviceUrl:new URL('/api/payment',origin).href,
        returnUrl:new URL('/api/return?id=' + attempt,origin).href,
        paymentSystems:'card;googlePay;applePay', regularMode:'none', language:'EN'
      }});
    }
    const {merchantAccount,orderReference,amount,currency,authCode,cardPan,transactionStatus,reasonCode,merchantSignature} = data;
    if (merchantAccount !== merchant() || !uuid.test(orderReference || '') || Number(amount) !== 1 || currency !== 'USD' || typeof transactionStatus !== 'string' || !/^[a-f0-9]{32}$/i.test(merchantSignature || '')) return reply({error:'Invalid payment data.'},400);
    const expected = sign(merchantAccount,orderReference,amount,currency,authCode,cardPan,transactionStatus,reasonCode);
    if (!timingSafeEqual(Buffer.from(expected,'hex'),Buffer.from(merchantSignature,'hex'))) return reply({error:'Invalid signature.'},403);
    const approved = transactionStatus === 'Approved' && String(reasonCode) === '1100';
    const rows = await sql`UPDATE mindtest_attempts SET
      paid_at = CASE WHEN ${approved} THEN COALESCE(paid_at,now()) ELSE paid_at END,
      payment_status = CASE WHEN paid_at IS NOT NULL THEN payment_status ELSE ${transactionStatus} END
      WHERE id = ${orderReference} RETURNING id`;
    if (!rows.length) return reply({error:'Unknown order.'},404);
    const time = Math.floor(Date.now()/1000);
    return reply({orderReference,status:'accept',time,signature:sign(orderReference,'accept',time)});
  } catch {
    return reply({error:'Payment service is temporarily unavailable.'},503);
  }
}
