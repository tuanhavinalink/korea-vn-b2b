import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Auth protection is handled at page level via getCurrentProfile()
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
