/* Toss 결제창(구버전) SDK 로더 — API 개별 연동 클라이언트 키만 사용한다.
 * 시크릿 키는 절대 프론트에 두지 않는다. */
interface TossPaymentParams {
  amount: number;
  orderId: string;
  orderName: string;
  customerName?: string;
  customerEmail?: string;
  successUrl: string;
  failUrl: string;
}

interface TossPaymentsClient {
  requestPayment(method: string, params: TossPaymentParams): Promise<void>;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsClient;
  }
}

const SDK_SRC = 'https://js.tosspayments.com/v1/payment';
let loading: Promise<void> | null = null;

export function loadTossPaymentSdk(): Promise<void> {
  if (window.TossPayments) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error('TOSS_SDK_LOAD_FAILED'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export async function requestCardPayment(input: {
  clientKey: string;
  amount: number;
  orderId: string;
  orderName: string;
  customerName?: string;
  customerEmail?: string;
  successUrl: string;
  failUrl: string;
}): Promise<void> {
  if (!input.clientKey.trim()) throw new Error('TOSS_CLIENT_KEY_MISSING');
  await loadTossPaymentSdk();
  const factory = window.TossPayments;
  if (!factory) throw new Error('TOSS_SDK_UNAVAILABLE');

  await factory(input.clientKey).requestPayment('카드', {
    amount: input.amount,
    orderId: input.orderId,
    orderName: input.orderName,
    ...(input.customerName ? { customerName: input.customerName } : {}),
    ...(input.customerEmail ? { customerEmail: input.customerEmail } : {}),
    successUrl: input.successUrl,
    failUrl: input.failUrl,
  });
}
