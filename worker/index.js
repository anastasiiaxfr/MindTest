import handler from 'vinext/server/fetch-handler';
import {paymentReturn} from '../lib/payment-return.js';
import {POST as paymentPost} from '../app/api/[action]/route.js';

export default {
  fetch(request, env, context) {
    const {pathname} = new URL(request.url);

    // WayForPay sends a cross-origin form POST when the buyer returns.
    if (pathname === '/api/return' && ['GET','POST'].includes(request.method)) {
      return paymentReturn(request);
    }

    // The webhook authenticates its payload with the merchant signature.
    if (pathname === '/api/payment' && request.method === 'POST') {
      return paymentPost(request, {params:{action:'payment'}});
    }

    return handler.fetch(request, env, context);
  }
};
