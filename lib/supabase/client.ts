import { createClient } from "@supabase/supabase-js";

// 서버 컴포넌트 전용 클라이언트. 인증이 필요 없는 공개 데이터 조회만 다룬다.
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)가 설정되지 않았습니다.");
  }

  return createClient(url, key);
}
