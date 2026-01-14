"use client"

import { AppHeader } from "@/components/app-header"
import { UserActions } from "@/components/user-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { Camera, Shield, Bell } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader rightSlot={<UserActions />} />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-2">Profile</h2>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="bg-card/60 backdrop-blur-lg border-border/40">
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                  <CardDescription>Update your avatar</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
                    AM
                  </div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="bg-card/60 backdrop-blur-lg border-border/40">
                <CardHeader>
                  <CardTitle>Account Details</CardTitle>
                  <CardDescription>Edit your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" defaultValue="Amri Example" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="amri@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell your family about your taste in movies..." />
                  </div>
                  <Button>Save changes</Button>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/40">
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Personalize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Request Notifications
                      </p>
                      <p className="text-sm text-muted-foreground">Get notified when requests are approved</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Parental Controls
                      </p>
                      <p className="text-sm text-muted-foreground">Filter mature content in your library</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
