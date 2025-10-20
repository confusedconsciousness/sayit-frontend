'use client'
import {SignIn} from "@clerk/nextjs";
import {sendGAEvent} from "@next/third-parties/google";


export default function Page() {
  return (
      <div className="flex items-center justify-center" onClick={() => {
        sendGAEvent('event', 'sign-in-event')
      }}>
        <SignIn
            signUpUrl={"sign-up"}
        />
      </div>
  );
}
