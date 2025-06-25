import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/updateSession";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/profile/:path*", "/edit/:path*"],
};
