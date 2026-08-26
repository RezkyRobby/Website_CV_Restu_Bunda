import { LinkButton } from "@/components/ui/button";
import { workerCategoryLabels } from "@/messages/labels";
import { calculateAge, whatsappBookingHref } from "@/server/catalog";
import type { SanitizedCandidate } from "@/server/catalog";

/**
 * Kartu Kandidat — DESIGN.md §5.5
 * Foto 3:4, chip keahlian Warm Sand, badge verifikasi Emerald Soft, CTA WA full-width.
 * TIDAK merender NIK, alamat, atau URL dokumen mentah.
 */
export function CandidateCard({ candidate }: { candidate: SanitizedCandidate }) {
  const age = calculateAge(candidate.birthDate);

  return (
    <article className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:-translate-y-1">
      {/* Foto 3:4 */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F3EAD8]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={candidate.photoProfileUrl}
          alt={`Foto ${candidate.nickname}`}
          className="size-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Badan kartu */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[18px] font-semibold leading-tight text-[#26221B]">{candidate.nickname}</h3>
        <p className="mt-1 text-sm text-[#6F675A]">
          {age} tahun · {candidate.ethnicity} · {workerCategoryLabels[candidate.category]}
        </p>

        {/* Chip keahlian — maks 3 */}
        {candidate.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {candidate.skills.slice(0, 3).map((skill) => (
              <span
                key={skill.id}
                className="rounded-full bg-[#F3EAD8] px-2.5 py-1 text-xs font-medium text-[#26221B]"
              >
                {skill.name}
              </span>
            ))}
          </div>
        )}

        {/* Badge verifikasi — DESIGN.md §5.6 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span
            className={[
              "rounded-full px-2.5 py-1 text-xs font-medium",
              candidate.skckVerified ? "bg-[#DCEDE6] text-[#064E3B]" : "bg-[#F0EEE9] text-[#57534E]",
            ].join(" ")}
          >
            SKCK {candidate.skckVerified ? "✓" : "—"}
          </span>
          <span
            className={[
              "rounded-full px-2.5 py-1 text-xs font-medium",
              candidate.mcuReportUrl ? "bg-[#DCEDE6] text-[#064E3B]" : "bg-[#F0EEE9] text-[#57534E]",
            ].join(" ")}
          >
            MCU {candidate.mcuReportUrl ? "✓" : "—"}
          </span>
        </div>

        {/* Meta ringkas */}
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-[#6F675A]">
          {candidate.petTolerance && (
            <span className="rounded-full bg-white px-2 py-1 ring-1 ring-[#E3D5BC]">Toleransi Hewan</span>
          )}
          {candidate.willingOutOfCity && (
            <span className="rounded-full bg-white px-2 py-1 ring-1 ring-[#E3D5BC]">Bersedia Luar Kota</span>
          )}
        </div>

        {/* CTA — DESIGN.md §5.1 primary button */}
        <div className="mt-4">
          <LinkButton
            href={whatsappBookingHref({ nickname: candidate.nickname, id: candidate.id })}
            target="_blank"
            rel="noopener noreferrer"
            size="md"
            className="w-full"
          >
            Booking via WhatsApp
          </LinkButton>
        </div>
      </div>
    </article>
  );
}
