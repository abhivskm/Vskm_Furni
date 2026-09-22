"use client";

import { use } from "react";
import GroupPage from "@/components/GroupPage";

/** /<section-slug>/<card-slug>, e.g. /category/sofa or /space/hall */
export default function Page({ params }: { params: Promise<{ section: string; group: string }> }) {
  const { section, group } = use(params);
  return <GroupPage sectionSlug={section} groupSlug={group} />;
}
