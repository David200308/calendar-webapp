#!/bin/bash
cd /root/email_reminder_cron

node index.js >> reminder_logs.log 2>&1
