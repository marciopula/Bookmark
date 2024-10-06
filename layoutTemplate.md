Template UI: Dashboard for Chrome Bookmark Synchronization
Structure

1. Header / Navbar
   Contains a Logo, Navigation Buttons, and a User Dropdown.
   Logo: Displays on the left side as an image (src="/placeholder.svg?height=32&width=32", alternative text: "Logo").
   Navigation Buttons:
   Buttons for navigating between "Dashboard", "Devices", and "Settings" using a button component.
   Conditional styling based on the active page.
   User Dropdown Menu:
   Includes the user avatar, name, and a dropdown menu triggered on click.
   Dropdown options include "Profile", "Settings", and "Logout".
   Uses avatar image from user.avatar or fallback to the first letter of the user’s name.
2. Main Content
   2.1. Welcome Section
   Displays a greeting, e.g., "Welcome back, [user.name]!".
   Informs the user about the number of connected devices and synced bookmarks using dynamic text.
   2.2. Devices Summary
   A summary grid showing the user's connected devices.
   Each device is displayed inside a card component containing:
   Device name as the card title.
   A device icon (laptop, desktop, etc.).
   Last sync information (e.g., "Last synced: 2h ago").
   Device type (e.g., "Laptop", "Desktop", etc.).
   2.3. Recent Bookmarks
   Displays a list of recently synced bookmarks in a card component.
   Each bookmark entry shows:
   The bookmark title as a clickable link.
   The favicon as a small image (16x16) next to the title.
   2.4. Call to Action
   If no devices are connected, a call-to-action card is displayed:
   Text prompts the user to install the browser extension.
   A button labeled "Install Extension" is provided for the user to start syncing bookmarks.
   Components Breakdown
3. Buttons
   Primary Navigation Buttons: Toggle the active page between "Dashboard", "Devices", and "Settings".
   Icons: Uses SVG icons for visual navigation cues.
   Button Variants:
   "Default" variant for the active tab.
   "Ghost" variant for inactive tabs.
4. Cards
   Device Cards: Display device-specific information, including name, icon, and sync status.
   Layout: Two-column layout for small screens, three-column layout for larger screens.
   Bookmarks Card: Contains a list of recent bookmarks, each linked to its respective URL.
5. Dropdown Menu
   Avatar Menu: Shows the user’s avatar (or fallback letter) and triggers a dropdown with options:
   Profile
   Settings
   Logout
   Dynamic Content
6. User Data
   The template references a user object for name and avatar image.
   Example:
   json
   Copy code
   {
   "name": "John Doe",
   "email": "john@example.com",
   "avatar": "/placeholder.svg?height=40&width=40"
   }
7. Devices
   The devices array contains device-specific information including:
   Device name
   Type (e.g., laptop, desktop)
   Sync status
8. Bookmarks
   The recentBookmarks array contains bookmarks with the following properties:
   Bookmark title
   Bookmark URL
   Favicon image URL (16x16)
   Layout and Styling
   Responsive Grid Layout:
   Grid layout is used to display devices (1 column on small screens, 2-3 columns on larger screens).
   Spacing:
   Appropriate padding/margin around sections (e.g., .mt-8, .mb-4, .p-6).
   Typography:
   Headings for major sections (e.g., "Welcome back, [user.name]!", "Your Devices", "Recent Bookmarks").
   Font weights and sizes are used for clear hierarchy.
   Conditional Rendering
9. Tab Navigation
   Changes the main view based on which tab is active (activeTab state):
   Dashboard, Devices, or Settings.
10. Call to Action for Devices
    If devices.length === 0, a call to action to install the extension is displayed.
    Interactivity
    Dropdown Menus:
    User clicks on avatar to reveal the menu options (Profile, Settings, Logout).
    Device Cards:
    Devices are displayed in a clickable card format (future interactions could be added).
    Bookmark Links:
    Each recent bookmark is a clickable link that opens the URL in a new tab.
    Assets and Icons
    Logo:
    Placeholder SVG used for the logo and user avatar.
    SVG Icons:
    Uses Lucide icons (Bell, ChevronDown, User, Settings, LogOut).
    Favicons:
    Favicon images for bookmarks (16x16) for visual recognition.
    Color Palette and Design
    Background: Light grey (bg-gray-100) for the main page background.
    Primary Text: Dark grey (text-gray-900) for headings and primary text.
    Secondary Text: Light grey (text-gray-600) for secondary information (e.g., device type, last synced).
    Button Styles:
    "Ghost" buttons for inactive tabs and navigation items.
    Primary buttons for actions (e.g., Install Extension button).

##### Layout CODE SAMPLE

import { useState } from 'react'
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for demonstration
const user = {
name: 'John Doe',
email: 'john@example.com',
avatar: '/placeholder.svg?height=40&width=40'
}

const devices = [
{ id: 1, name: 'Laptop', type: 'laptop' },
{ id: 2, name: 'Desktop', type: 'desktop' },
{ id: 3, name: 'Phone', type: 'smartphone' },
]

const recentBookmarks = [
{ id: 1, title: 'Google', url: 'https://www.google.com', favicon: '/placeholder.svg?height=16&width=16' },
{ id: 2, title: 'GitHub', url: 'https://github.com', favicon: '/placeholder.svg?height=16&width=16' },
{ id: 3, title: 'Stack Overflow', url: 'https://stackoverflow.com', favicon: '/placeholder.svg?height=16&width=16' },
]

export default function Dashboard() {
const [activeTab, setActiveTab] = useState('dashboard')

return (

<div className="min-h-screen bg-gray-100">
{/_ Header/Navbar _/}
<header className="bg-white shadow-sm">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between h-16">
<div className="flex">
<div className="flex-shrink-0 flex items-center">
<img className="h-8 w-auto" src="/placeholder.svg?height=32&width=32" alt="Logo" />
</div>
<nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
<Button
variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
onClick={() => setActiveTab('dashboard')} >
Dashboard
</Button>
<Button
variant={activeTab === 'devices' ? 'default' : 'ghost'}
onClick={() => setActiveTab('devices')} >
Devices
</Button>
<Button
variant={activeTab === 'settings' ? 'default' : 'ghost'}
onClick={() => setActiveTab('settings')} >
Settings
</Button>
</nav>
</div>
<div className="flex items-center">
<Button variant="ghost" size="icon">
<Bell className="h-5 w-5" />
</Button>
<DropdownMenu>
<DropdownMenuTrigger asChild>
<Button variant="ghost" className="ml-3 flex items-center">
<Avatar className="h-8 w-8">
<AvatarImage src={user.avatar} alt={user.name} />
<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
</Avatar>
<ChevronDown className="ml-2 h-4 w-4" />
</Button>
</DropdownMenuTrigger>
<DropdownMenuContent align="end">
<DropdownMenuItem>
<User className="mr-2 h-4 w-4" />
Profile
</DropdownMenuItem>
<DropdownMenuItem>
<Settings className="mr-2 h-4 w-4" />
Settings
</DropdownMenuItem>
<DropdownMenuItem>
<LogOut className="mr-2 h-4 w-4" />
Logout
</DropdownMenuItem>
</DropdownMenuContent>
</DropdownMenu>
</div>
</div>
</div>
</header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="mt-1 text-sm text-gray-600">
            You have {devices.length} devices connected and {recentBookmarks.length} bookmarks synced.
          </p>
        </div>

        {/* Devices Summary */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Devices</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
              <Card key={device.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{device.name}</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <line x1="8" x2="16" y1="21" y2="21" />
                    <line x1="12" x2="12" y1="17" y2="21" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Last synced: 2h ago</div>
                  <p className="text-xs text-muted-foreground">
                    {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Bookmarks */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookmarks</h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-200">
                {recentBookmarks.map((bookmark) => (
                  <li key={bookmark.id} className="p-4 hover:bg-gray-50">
                    <a href={bookmark.url} className="flex items-center space-x-3">
                      <img src={bookmark.favicon} alt="" className="h-4 w-4" />
                      <span className="text-sm font-medium text-gray-900">{bookmark.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {devices.length === 0 && (
          <div className="mt-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Get Started</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Install our browser extension to start syncing your bookmarks across devices.
                </p>
                <Button className="mt-4">Install Extension</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>

)
}
