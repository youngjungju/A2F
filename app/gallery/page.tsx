'use client';

import { useRouter } from 'next/navigation';
import { SAMPLE_PLAYERS } from '@/lib/playerData';
import { spacing, typography, colors, interaction } from '@/lib/designTokens';

export default function GalleryPage() {
  const router = useRouter();

  const handlePlayerClick = (playerId: string) => {
    localStorage.setItem('lastViewedPlayer', playerId);
    router.push('/explore');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header
        className="backdrop-blur-lg"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderBottom: `1px solid ${colors.dark.fill.tertiary}`,
          paddingTop: spacing[96],
        }}
      >
        <div
          className="max-w-7xl mx-auto flex items-center justify-between"
          style={{
            paddingLeft: spacing[24],
            paddingRight: spacing[24],
            paddingTop: spacing[24],
            paddingBottom: spacing[24],
          }}
        >
          <div>
            <h1
              style={{
                fontSize: typography.fontSize.title1,
                fontWeight: typography.fontWeight.bold,
                color: colors.dark.label.primary,
              }}
            >
              Gallery
            </h1>
            <p
              style={{
                fontSize: typography.fontSize.footnote,
                color: colors.dark.label.secondary,
                marginTop: spacing[4],
              }}
            >
              모든 선수들의 시각화 결과
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="max-w-7xl mx-auto"
        style={{
          paddingLeft: spacing[24],
          paddingRight: spacing[24],
          paddingTop: spacing[48],
          paddingBottom: spacing[48],
        }}
      >
        {/* Search and Filter */}
        <div
          className="flex"
          style={{
            marginBottom: spacing[32],
            gap: spacing[16],
          }}
        >
          <input
            type="text"
            placeholder="Search players..."
            style={{
              flex: 1,
              padding: spacing[12],
              backgroundColor: colors.dark.fill.primary,
              border: `1px solid ${colors.dark.fill.tertiary}`,
              borderRadius: interaction.borderRadius.medium,
              color: colors.dark.label.primary,
              fontSize: typography.fontSize.body,
              outline: 'none',
            }}
          />
          <select
            style={{
              padding: spacing[12],
              backgroundColor: colors.dark.fill.primary,
              border: `1px solid ${colors.dark.fill.tertiary}`,
              borderRadius: interaction.borderRadius.medium,
              color: colors.dark.label.primary,
              fontSize: typography.fontSize.body,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">All Positions</option>
            <option value="forward">Forward</option>
            <option value="midfielder">Midfielder</option>
            <option value="defender">Defender</option>
            <option value="goalkeeper">Goalkeeper</option>
          </select>
        </div>

        {/* Player Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{
            gap: spacing[24],
          }}
        >
          {SAMPLE_PLAYERS.map((player) => (
            <div
              key={player.id}
              onClick={() => handlePlayerClick(player.id)}
              className="group relative overflow-hidden cursor-pointer"
              style={{
                backgroundColor: colors.dark.fill.primary,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${colors.dark.fill.tertiary}`,
                borderRadius: interaction.borderRadius.xlarge,
                transition: `all ${interaction.duration.slow} ${interaction.easing.standard}`,
                textDecoration: 'none',
                color: colors.dark.label.primary,
              }}
            >
              {/* Preview Area (placeholder for gradient preview) */}
              <div className="aspect-square bg-gradient-to-br from-purple-900 via-red-900 to-blue-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold opacity-20">{player.nameKo[0]}</div>
                  </div>
                </div>
              </div>

              {/* Player Info */}
              <div
                style={{
                  padding: spacing[24],
                }}
              >
                <h3
                  style={{
                    fontSize: typography.fontSize.title2,
                    fontWeight: typography.fontWeight.semibold,
                    marginBottom: spacing[4],
                    color: colors.dark.label.primary,
                  }}
                >
                  {player.name}
                </h3>
                <p
                  style={{
                    fontSize: typography.fontSize.headline,
                    color: colors.dark.label.secondary,
                    marginBottom: spacing[12],
                  }}
                >
                  {player.nameKo}
                </p>
                {player.position && (
                  <p
                    style={{
                      fontSize: typography.fontSize.footnote,
                      color: colors.dark.label.tertiary,
                      marginBottom: spacing[16],
                    }}
                  >
                    {player.position}
                  </p>
                )}

                {/* Club Colors Preview */}
                <div
                  style={{
                    display: 'flex',
                    gap: spacing[8],
                  }}
                >
                  {player.clubs.slice(0, 5).map((club, index) =>
                    club.colors.map((color, colorIndex) => (
                      <div
                        key={`${index}-${colorIndex}`}
                        className="rounded-full"
                        style={{
                          width: spacing[24],
                          height: spacing[24],
                          backgroundColor: color,
                          border: `2px solid ${colors.dark.fill.tertiary}`,
                        }}
                        title={club.name}
                      />
                    ))
                  )}
                </div>

                {/* Career Stats */}
                <div
                  style={{
                    marginTop: spacing[16],
                    paddingTop: spacing[16],
                    borderTop: `1px solid ${colors.dark.fill.tertiary}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: typography.fontSize.footnote,
                  }}
                >
                  <span style={{ color: colors.dark.label.tertiary }}>Clubs</span>
                  <span style={{ fontWeight: typography.fontWeight.medium }}>{player.clubs.length}</span>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Empty State (if no players match filter) */}
        {SAMPLE_PLAYERS.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-white/50">No players found</p>
            <p className="text-sm text-white/40 mt-2">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Coming Soon Notice */}
        <div
          className="text-center"
          style={{
            marginTop: spacing[64],
            padding: spacing[32],
            backgroundColor: colors.dark.fill.primary,
            border: `1px solid ${colors.dark.fill.tertiary}`,
            borderRadius: interaction.borderRadius.xlarge,
          }}
        >
          <h3
            style={{
              fontSize: typography.fontSize.title2,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing[12],
              color: colors.dark.label.primary,
            }}
          >
            More Players Coming Soon
          </h3>
          <p
            style={{
              fontSize: typography.fontSize.body,
              color: colors.dark.label.secondary,
            }}
          >
            손흥민, 이강인, 황희찬 등 더 많은 선수들의 시각화가 추가될 예정입니다.
          </p>
        </div>
      </main>
    </div>
  );
}
