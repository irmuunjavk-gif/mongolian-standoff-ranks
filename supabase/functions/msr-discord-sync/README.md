# Discord team sync

Reads only channel 1563893301269237812. Runs every two minutes through pg_cron and pg_net. DISCORD_BOT_TOKEN stays in Edge Function Secrets. Invocation is protected by a random Vault token; only its SHA-256 hash is stored in the RLS-protected msr_discord_sync_state table. No raw message text is returned or stored.

Supported registrations have Clan/Team name and at least five player nickname + numeric game ID lines. Only nicknames, team name/tag and image logos are published. Other formats are skipped. Logos must be PNG/JPEG/WebP under 2 MiB from Discord attachments and are copied into team-logos. Names are normalized for deduplication; newer messages update existing database rows without resetting points. Polling scans at most the latest 1,000 messages.

The site loads msr_discord_teams on page load. Existing embedded teams, logos, rosters and points are preserved. New teams use the existing ranking/team/player views and start at 50 points. Refresh the page to see newly imported teams. Name changes can require staff reconciliation.

Monitor: SELECT last_success,last_status,imported FROM public.msr_discord_sync_state;
Pause: SELECT cron.unschedule('msr-discord-team-sync');
Rollback frontend: restore index.html from backup/msr-before-discord-sync-20261101.
