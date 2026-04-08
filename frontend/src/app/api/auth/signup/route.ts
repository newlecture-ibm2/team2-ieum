import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id, password, nickname, phone, isMarketingAgreed } = await req.json();

    // 백엔드에 회원가입(register) 요청 전달
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password, nickname, phone, isMarketingAgreed }),
    });

    if (!backendRes.ok) {
      // 에러 발생 시 백엔드 응답 파싱
      let errorData;
      try {
        errorData = await backendRes.json();
      } catch (e) {
        errorData = { message: "회원가입 처리에 실패했습니다." };
      }
      return NextResponse.json(
        { message: errorData.error?.message || errorData.message || "이미 가입된 아이디이거나 서버 에러입니다." },
        { status: backendRes.status }
      );
    }

    // 성공 시: RegisterForm.tsx가 수정 없이 바로 통과될 수 있도록 
    // response.data.status === 'SUCCESS' 조건에 맞는 JSON 응답 반환!
    return NextResponse.json({ status: "SUCCESS" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "프론트엔드 서버 오류가 발생했습니다." }, { status: 500 });
  }
}
