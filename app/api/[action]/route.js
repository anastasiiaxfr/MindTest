import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { score } from '../../../lib/scoring.js';
import { tests } from '../../../lib/tests.js';
import { attemptIdPattern as uuid, paymentReturn } from '../../../lib/payment-return.js';

export const dynamic = 'force-dynamic';
const reply = (body, status = 200) => Response.json(body, {status, headers: {'Cache-Control':'no-store', 'X-Robots-Tag':'noindex, nofollow, noarchive'}});
const secret = () => process.env.WAYFORPAY_MERCHANT_SECRET;
const merchant = () => process.env.WAYFORPAY_MERCHANT_ACCOUNT;
const sign = (...fields) => createHmac('md5', secret()).update(fields.map(v => v ?? '').join(';')).digest('hex');
const db = () => neon(process.env.DATABASE_URL);
const ready = () => Boolean(secret() && merchant() && process.env.APP_URL);

const finalFailures = ['Declined','Expired','Refunded','Voided'];

function verifyPayment(data) {
  if (!data || typeof data !== 'object') return 'Invalid payment data.';
  const {merchantAccount,orderReference,amount,currency,authCode,cardPan,transactionStatus,reasonCode,merchantSignature} = data;
  if (merchantAccount !== merchant() || !uuid.test(orderReference || '') || Number(amount) !== 1 || currency !== 'USD' || typeof transactionStatus !== 'string' || !/^[a-f0-9]{32}$/i.test(merchantSignature || '')) return 'Invalid payment data.';
  const expected = sign(merchantAccount,orderReference,amount,currency,authCode,cardPan,transactionStatus,reasonCode);
  if (!timingSafeEqual(Buffer.from(expected,'hex'),Buffer.from(merchantSignature,'hex'))) return 'Invalid signature.';
  return null;
}

async function recordPayment(sql, data) {
  const {orderReference, transactionStatus, reasonCode} = data;
  const approved = transactionStatus === 'Approved' && String(reasonCode) === '1100';
  const [row] = await sql`UPDATE mindtest_attempts SET
    paid_at = CASE WHEN ${approved} THEN COALESCE(paid_at,now()) ELSE paid_at END,
    payment_status = CASE WHEN paid_at IS NOT NULL THEN payment_status ELSE ${transactionStatus} END
    WHERE id = ${orderReference}
    RETURNING test, payment_status, paid_at, CASE WHEN paid_at IS NOT NULL THEN result END AS result`;
  return row;
}

async function checkPayment(sql, id) {
  // Claim a bounded check in Neon so concurrent visits share the same limit.
  const [claim] = await sql`UPDATE mindtest_attempts SET last_payment_check_at = now()
    WHERE id = ${id} AND paid_at IS NULL AND created_at > now() - interval '7 days'
    AND payment_status NOT IN ('Declined','Expired','Refunded','Voided')
    AND (last_payment_check_at IS NULL OR last_payment_check_at < now() - interval '12 seconds')
    RETURNING id`;
  if (!claim) return null;
  const account = merchant();
  const response = await fetch('https://api.wayforpay.com/api', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      apiVersion:1, transactionType:'CHECK_STATUS', merchantAccount:account,
      orderReference:id, merchantSignature:sign(account,id)
    }),
    signal:AbortSignal.timeout(4500)
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (!data || data.orderReference !== id || verifyPayment(data)) return null;
  return recordPayment(sql, data);
}

export async function GET(request, {params}) {
  const {action} = await params;
  if (action === 'return') return paymentReturn(request);
  const id = new URL(request.url).searchParams.get('id') || '';
  if (action !== 'result' || !uuid.test(id)) return reply({error:'Result not found.'}, 404);
  try {
    const sql = db();
    const [row] = await sql`SELECT test, payment_status, paid_at, CASE WHEN paid_at IS NOT NULL THEN result END AS result FROM mindtest_attempts WHERE id = ${id}`;
    if (!row) return reply({error:'Result not found.'},404);
    if (!row.paid_at && !finalFailures.includes(row.payment_status) && ready()) {
      const updated = await checkPayment(sql, id).catch(()=>null);
      if (updated) return reply(updated);
    }
    return reply(row);
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
      const {test, answers, attempt, version} = data;
      if (typeof test !== 'string' || !Object.hasOwn(tests, test) || typeof attempt !== 'string' || !uuid.test(attempt)) return reply({error:'Invalid attempt.'},400);
      const result = score(test, answers, version);
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
    const error = verifyPayment(data);
    if (error) return reply({error}, error === 'Invalid signature.' ? 403 : 400);
    const {orderReference} = data;
    if (!await recordPayment(sql, data)) return reply({error:'Unknown order.'},404);
    const time = Math.floor(Date.now()/1000);
    return reply({orderReference,status:'accept',time,signature:sign(orderReference,'accept',time)});
  } catch {
    return reply({error:'Payment service is temporarily unavailable.'},503);
  }
}
