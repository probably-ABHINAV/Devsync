export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6 text-center">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            We've sent a confirmation link to your email address. Please click it to verify your account and start using
            Opscord.
          </p>
        </div>
      </div>
    </div>
  )
}
