import { config, collection, fields } from '@keystatic/core';

// Admin UI for editing events at /keystatic (dev only — see astro.config.mjs).
// Fields mirror the events schema in src/content.config.ts; keep them in sync.
//
// Storage: local mode edits files on disk. Set PUBLIC_KEYSTATIC_STORAGE=github
// (in .env or the deploy host's env) to switch to GitHub mode, where editors
// sign in with GitHub and every save is a commit to the repo. GitHub mode also
// needs the app credentials created by Keystatic's /keystatic setup flow:
// KEYSTATIC_GITHUB_CLIENT_ID, KEYSTATIC_GITHUB_CLIENT_SECRET, KEYSTATIC_SECRET,
// PUBLIC_KEYSTATIC_GITHUB_APP_SLUG.
export default config({
  storage:
    import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github'
      ? { kind: 'github', repo: 'bwnapdx/bwna-site' }
      : { kind: 'local' },
  ui: {
    brand: { name: 'BWNA' },
  },
  collections: {
    events: collection({
      label: 'Events',
      slugField: 'title',
      path: 'src/content/events/*',
      entryLayout: 'form',
      format: { frontmatter: 'yaml', contentField: 'body' },
      columns: ['date', 'type', 'featured'],
      schema: {
        title: fields.slug({
          name: { label: 'Title', validation: { isRequired: true } },
          slug: {
            label: 'Filename',
            description:
              'Prefix one-off events with the date, e.g. 2026-07-18-art-garden-tour. Recurring series omit the date.',
          },
        }),
        date: fields.date({
          label: 'Date',
          description:
            'One-off: the event day. Recurring: earliest occurrence (series start).',
          validation: { isRequired: true },
        }),
        endDate: fields.date({
          label: 'End date',
          description:
            'One-off: multi-day end. Recurring: latest occurrence (series end). Leave blank otherwise.',
        }),
        time: fields.text({
          label: 'Time',
          description: 'e.g. "7:00 PM - 8:30 PM"',
          validation: { isRequired: true },
        }),
        location: fields.text({
          label: 'Location',
          validation: { isRequired: true },
        }),
        address: fields.text({
          label: 'Address',
          description: 'Street address, if the location name alone is not enough.',
        }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Meeting', value: 'meeting' },
            { label: 'Community', value: 'community' },
            { label: 'Social', value: 'social' },
            { label: 'Tour', value: 'tour' },
          ],
          defaultValue: 'community',
        }),
        scope: fields.select({
          label: 'Scope',
          options: [
            { label: 'BWNA', value: 'bwna' },
            { label: 'Neighborhood', value: 'neighborhood' },
            { label: 'City', value: 'city' },
          ],
          defaultValue: 'bwna',
        }),
        featured: fields.checkbox({ label: 'Featured' }),
        recurring: fields.checkbox({
          label: 'Recurring',
          description: 'If checked, fill in the recurrence fields below.',
        }),
        recurrenceWeek: fields.array(
          fields.integer({
            label: 'Week',
            validation: { min: 1, max: 5 },
          }),
          {
            label: 'Recurrence weeks',
            description:
              'Week(s) of the month the event falls on: 2 = 2nd week; 2 and 4 = 2nd & 4th.',
            itemLabel: (props) =>
              props.value == null ? 'Week' : `Week ${props.value}`,
          }
        ),
        recurrenceDay: fields.integer({
          label: 'Recurrence day',
          description: 'Day of week: 0 = Sunday, 1 = Monday, … 6 = Saturday.',
          validation: { min: 0, max: 6 },
        }),
        recurrenceMonths: fields.select({
          label: 'Recurrence months',
          options: [
            { label: 'Every month', value: 'all' },
            { label: 'Even months', value: 'even' },
            { label: 'Odd months', value: 'odd' },
          ],
          defaultValue: 'all',
        }),
        image: fields.image({
          label: 'Image',
          directory: 'public/images',
          publicPath: '/images/',
        }),
        imageAlt: fields.text({
          label: 'Image alt text',
          description: 'Describe the image for screen readers.',
        }),
        summary: fields.text({
          label: 'Summary',
          description: 'Short teaser shown on event cards and listings.',
          multiline: true,
        }),
        ticketUrl: fields.url({
          label: 'Ticket URL',
          description: 'External ticketing/RSVP page (e.g. Eventbrite).',
        }),
        body: fields.markdoc({
          label: 'Details',
          extension: 'md',
          description: 'Longer description shown on the event page. Optional.',
        }),
      },
    }),
  },
});
