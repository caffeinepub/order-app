import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Rocket, Globe, Smartphone, Info } from 'lucide-react';

export default function PublishSellGuidance() {
  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Publish & Sell
        </CardTitle>
        <CardDescription>Learn how to share and distribute your app</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="web-link">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Share as a Web Link</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p>
                The easiest way to share your app is as a web link. Your app is already live and accessible via its URL.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Share the URL directly with users</li>
                <li>Works on any device with a web browser</li>
                <li>No installation required</li>
                <li>Updates are instant for all users</li>
              </ul>
              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  Users can add the web app to their home screen on mobile devices for a native-like experience.
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="play-store">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Google Play Store Distribution</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p>
                To distribute your app on the Google Play Store, you'll need to package it as a native Android app.
              </p>
              <div className="space-y-2">
                <p className="font-medium">High-level steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Use a tool like Capacitor, Cordova, or PWA Builder to wrap your web app</li>
                  <li>Create a Google Play Developer account ($25 one-time fee)</li>
                  <li>Generate a signed APK or AAB file</li>
                  <li>Create a store listing with screenshots and description</li>
                  <li>Submit for review (typically 1-3 days)</li>
                </ol>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Your app must comply with Google Play policies, including privacy policy requirements, content guidelines, and technical standards.
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="app-store">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Apple App Store Distribution</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p>
                To distribute your app on the Apple App Store, you'll need to package it as a native iOS app.
              </p>
              <div className="space-y-2">
                <p className="font-medium">High-level steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Use a tool like Capacitor or Cordova to wrap your web app</li>
                  <li>Enroll in the Apple Developer Program ($99/year)</li>
                  <li>Build your app using Xcode on a Mac</li>
                  <li>Create an App Store listing with screenshots and description</li>
                  <li>Submit for review (typically 1-3 days, stricter than Google)</li>
                </ol>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Apple has strict review guidelines. Your app must provide unique value, comply with privacy requirements, and meet technical standards. A Mac computer is required for iOS development.
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="limitations">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Important Limitations</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>This project is not automatically publishable to app stores.</strong> Additional work is required:
                </AlertDescription>
              </Alert>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Native app packaging using tools like Capacitor, Cordova, or PWA Builder</li>
                <li>Developer accounts (Google Play: $25 one-time, Apple: $99/year)</li>
                <li>Compliance with store policies and guidelines</li>
                <li>Code signing certificates and provisioning profiles</li>
                <li>Store listing assets (icons, screenshots, descriptions)</li>
                <li>Privacy policy and terms of service</li>
                <li>Testing on physical devices</li>
              </ul>
              <p className="text-muted-foreground">
                Consider starting with web distribution and only move to app stores if you need native features or store visibility.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
