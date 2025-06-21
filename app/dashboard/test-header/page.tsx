"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestHeaderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Header Test Page</h1>
        <p className="text-muted-foreground">
          This page tests the header and sidebar integration
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Header Integration</CardTitle>
            <CardDescription>Testing header positioning</CardDescription>
          </CardHeader>
          <CardContent>
            <p>The header should be visible at the top of the page.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sidebar Integration</CardTitle>
            <CardDescription>Testing sidebar positioning</CardDescription>
          </CardHeader>
          <CardContent>
            <p>The sidebar should be positioned below the header on the left.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Area</CardTitle>
            <CardDescription>Testing main content area</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This content should be properly positioned with the sidebar.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Responsive Test</CardTitle>
          <CardDescription>Testing responsive behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Try resizing the browser window to test responsive behavior. The header should remain at the top,
            and the sidebar should adjust properly.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}