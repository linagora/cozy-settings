import { clearNextcloudImportedFiles } from '@/components/Migration/useMigration'
import { NEXTCLOUD_MIGRATIONS_DOCTYPE } from '@/doctypes'

// Temporary test helper: remove with this flag once the reset feature is fully implemented.
export const RESET_NEXTCLOUD_MIGRATION_FLAG =
  'settings.reset-for-migration.enabled'

export const resetNextcloudMigrationForTests = async ({
  client,
  completedMigrationsQuery
}) => {
  const { data: migrationDocs } = await client
    .collection(NEXTCLOUD_MIGRATIONS_DOCTYPE)
    .all()

  await Promise.all(
    migrationDocs.map(migrationDoc =>
      client.collection(NEXTCLOUD_MIGRATIONS_DOCTYPE).destroy(migrationDoc)
    )
  )

  await clearNextcloudImportedFiles(client)

  await client.resetQuery(completedMigrationsQuery.options.as)
  const { data: refreshedCompletedMigrations } = await client.query(
    completedMigrationsQuery.definition,
    completedMigrationsQuery.options
  )

  return (refreshedCompletedMigrations?.length ?? 0) > 0
}
