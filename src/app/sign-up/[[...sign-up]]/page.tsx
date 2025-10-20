'use client'
import {SignUp} from "@clerk/nextjs";
import {sendGAEvent} from "@next/third-parties/google";

export default function Page() {
  return (
      <div className="flex items-center justify-center" onClick={() => {
        sendGAEvent('event', 'sign-up-event')
      }}>
        <SignUp signInForceRedirectUrl={"/sync"}/>
      </div>
  );
}
