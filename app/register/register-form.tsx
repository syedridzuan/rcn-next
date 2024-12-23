"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription as DialogDesc,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { RegisterSchema, type RegisterInput } from "@/lib/validations/auth"
import { registerAction } from "./actions"

export function RegisterForm() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      terms: false,
    },
  })

  function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      try {
        const result = await registerAction(data)
        if (!result.success) {
          // Jika terdapat ralat pada medan tertentu, paparkan
          if (result.fieldErrors) {
            for (const [field, error] of Object.entries(result.fieldErrors)) {
              form.setError(field as keyof RegisterInput, { message: error })
            }
            return
          }
          toast.error(result.message || "Pendaftaran gagal")
          return
        }
        // Berjaya
        toast.success("Akaun berjaya dicipta. Sila semak emel anda untuk pengesahan.")
        router.push("/auth/verify-email-prompt")
      } catch (error) {
        toast.error("Terdapat ralat. Sila cuba lagi.")
      }
    })
  }

  return (
    <Card className="mx-auto max-w-md shadow-lg rounded-lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold">Cipta Akaun Anda</CardTitle>
        <CardDescription className="text-md text-muted-foreground mt-2">
          Sertai komuniti kami sekarang dan kongsi keseronokan bersama.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Nama Penuh */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Nama Penuh</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama penuh anda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nama Pengguna */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Nama Pengguna</FormLabel>
                  <FormControl>
                    <Input placeholder="Pilih nama pengguna yang unik" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Emel */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Emel</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Masukkan emel anda"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kata Laluan */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Kata Laluan</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Cipta kata laluan"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kotak semak (Checkbox) Terma */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Terima terma dan syarat"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-tight">
                    <FormLabel className="text-sm font-medium">
                      Saya bersetuju dengan{" "}
                      <Dialog>
                        <DialogTrigger className="text-primary underline">
                          terma dan syarat
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Terma dan Syarat</DialogTitle>
                            <DialogDesc className="mt-2 text-sm">
                              <strong>Adakah anda telah membaca sepenuhnya?</strong>
                            </DialogDesc>
                          </DialogHeader>
                          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-6">
                            <DialogDesc className="text-sm space-y-4">
                              {/* 
                                Gantikan teks di bawah dengan sebarang teks terma & syarat 
                                yang lebih panjang dan terperinci yang anda inginkan.
                              */}
                              1. <strong>Penerimaan Terma:</strong> Dengan mendaftar akaun
                              di laman web/aplikasi kami, anda mengakui bahawa anda telah
                              membaca, memahami, dan bersetuju untuk terikat dengan terma
                              dan syarat ini. Jika anda tidak bersetuju, sila hentikan
                              pendaftaran atau penggunaan perkhidmatan.
                              <br />
                              <br />
                              2. <strong>Penggunaan Akaun:</strong> Anda bertanggungjawab
                              ke atas semua aktiviti yang berlaku melalui akaun anda, tidak
                              berkongsi kata laluan dengan pihak ketiga, dan memaklumkan
                              kepada kami tentang sebarang akses tidak sah.
                              <br />
                              <br />
                              3. <strong>Data Peribadi dan Privasi:</strong> Kami akan
                              memproses maklumat peribadi anda mengikut Dasar Privasi kami.
                              Sila pastikan maklumat anda tepat dan terkini.
                              <br />
                              <br />
                              4. <strong>Kelakuan Pengguna:</strong> Anda tidak dibenarkan
                              memuat naik kandungan yang menyalahi undang-undang atau
                              kandungan yang bersifat menyinggung perasaan, lucah, berunsur
                              kebencian, atau bahan yang boleh memudaratkan pengguna lain.
                              <br />
                              <br />
                              5. <strong>Pengubahsuaian Perkhidmatan:</strong> Kami berhak
                              mengemas kini atau menukar perkhidmatan kami pada bila-bila
                              masa tanpa notis awal.
                              <br />
                              <br />
                              6. <strong>Penamatan Akaun:</strong> Kami berhak menamatkan
                              atau menggantung akaun anda tanpa notis jika terdapat
                              pelanggaran terma. Anda juga boleh menamatkan akaun sendiri
                              pada bila-bila masa.
                              <br />
                              <br />
                              7. <strong>Penyataan Penafian:</strong> Kami tidak menjamin
                              perkhidmatan kami bebas daripada ralat atau gangguan. Segala
                              risiko tanggungan atas penggunaan adalah di bawah
                              tanggungjawab anda sendiri.
                              <br />
                              <br />
                              8. <strong>Perubahan Terma &amp; Syarat:</strong> Kami
                              berhak meminda terma ini pada bila-bila masa. Versi yang
                              terkini akan disiarkan di laman web/aplikasi kami.
                              <br />
                              <br />
                              9. <strong>Undang-Undang Terpakai:</strong> Terma &amp;
                              syarat ini hendaklah ditafsirkan mengikut undang-undang
                              Malaysia.
                            </DialogDesc>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
              disabled={!form.getValues("terms") || isPending}
            >
              {isPending ? "Sedang mencipta akaun..." : "Cipta akaun"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col items-center space-y-2 pt-6 border-t">
        <p className="text-sm text-muted-foreground">
          Sudah mempunyai akaun?{" "}
          <span
            onClick={() => router.push("/auth/signin")}
            className="cursor-pointer text-primary underline"
          >
            Log masuk di sini
          </span>
        </p>
      </CardFooter>
    </Card>
  )
}

