import Link from "next/link";
import { ProfileImage } from "@/components/public/profile-image";
import { StartBuildingButton } from "@/components/marketing/start-building-button";
import { snapshotSeo } from "@/lib/blocks/snapshot";
import type { DirectoryEntry } from "@/lib/supabase/queries";

/**
 * The directory listing grid.
 *
 * A profile only ever reaches here after it has been through the manual
 * approve gate (see set_directory_status() in the directory migration), so
 * — unlike the homepage's illustrative Explore rail — every card here links
 * to a real, live page.
 */
export function DirectoryGrid({ entries }: { entries: DirectoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="mt-16 rounded-[24px] border border-dashed border-border px-8 py-20 text-center">
        <p className="text-lg font-medium">Nothing listed yet.</p>
        <p className="text-muted-foreground mt-2 max-w-[46ch] mx-auto">
          Every page here is reviewed before it appears. Build yours and it
          could be one of the first.
        </p>
        <div className="mt-8 flex justify-center">
          <StartBuildingButton className="h-12 rounded-full px-8 text-sm font-semibold">
            Create your OWNA
          </StartBuildingButton>
        </div>
      </div>
    );
  }

  return (
    <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => {
        const { name, description } = snapshotSeo(entry.snapshot);
        return (
          <li key={entry.username}>
            <Link
              href={`/${entry.username}`}
              className="group flex h-full flex-col gap-4 rounded-[20px] border border-border p-6 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <ProfileImage
                  src={entry.snapshot.profile.avatarUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="truncate font-medium">{name}</div>
                  <div className="text-muted-foreground truncate text-sm">
                    @{entry.username}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                {description}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
