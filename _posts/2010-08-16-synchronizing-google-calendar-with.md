---
title: "Synchronizing Google Calendar with iPhone and Outlook"
description: "A 2010 walkthrough of synchronizing Google Calendar with Outlook and iPhone, including shared calendars and Exchange settings."
date: "2010-08-16T21:02:00.001Z"
last_modified_at: "2010-08-16T21:05:53.391Z"
permalink: "/2010/08/synchronizing-google-calendar-with.html"
tags: ["Networking"]
---

I bring this little tutorial to show how to synchronize [Google
Calendar](http://www.google.com/calendar) with both iPhone and Outlook. I use Outlook 2010 and
iPhone iOS 4.0.1 for this tutorial.

## Outlook 2010

1. Download and install [Google Calendar
   Sync](http://dl.google.com/googlecalendarsync/GoogleCalendarSync_Installer.exe) (link unavailable). This will
   enable you to synchronize between Google Calendar and Outlook.
2. Test out the synchronization by creating an event in Outlook calendar, right-clicking on the Google
   Calendar Sync icon in the notification area, and click “Sync”. Your event should show up in
   Google Calendar.

## iPhone iOS 4.x

1. Click “Settings” and click on “Mail, Contacts and Calendars”.
2. Click “Add account” and pick “Microsoft Exchange” (Yes, we use Microsoft Exchange in this case.
   It enables Google Mail, Google Contacts and Google Calendar push-notifications support)
3. Enter your information:
    1. E-Mail
    2. Leave Domain blank
    3. Your username; put your full email here
    4. Your password
    5. Description contains the name of the account. You can leave it to the default or choose one
       yourself.
4. Once you click Next, it should take 2 seconds and a Server field appears. Enter “m.google.com”
   and click Next again.
5. Select the services you want to sync. I have both mail and calendars synchronized with Google.

That is it. When you create a new event in Google Calendar, it will appear a few seconds after on
your iPhone.

## Shared Google calendars

A friend of mine and I share a calendar on Google Calendar. Unfortunately it can’t be synced with
Google Calendar Sync since it only works with your default Google calendar and default Outlook
calendar. However, there is a way to make your iPhone work with shared calendars:

1. On your iPhone, go to the address: m.google.com
2. Log in to Google using your Google account.
3. If it tells you that your device is unsupported, switch the language to English and it should
   disappear.
4. Select your device from the list.
5. Select the calendars you would like to sync.

Note: This did not work on my phone right away. I had to untick it and tick the shared calendar
again before it worked.

## Update:

Google has a [sync page](http://www.google.com/sync/index.html) that gives you a tutorial for your
device. The same tutorial as I wrote can be [found
here](http://www.google.com/support/mobile/bin/answer.py?answer=138740&topic=14252) for iPhone. I
will let this post live because it contains information not found in the Google sync tutorial (like
step 3 in shared calendars).