export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const loss = searchParams.get('loss') || '$0';
  const trades = searchParams.get('trades') || '0';
  const volume = searchParams.get('volume') || '$0';
  const incidents = searchParams.get('incidents') || '0';
  const sandwichVol = searchParams.get('sandwichVol') || '$0';
  const confirmed = searchParams.get('confirmed') === '1';

  const { ImageResponse } = await import('https://esm.sh/@vercel/og@0.6.2');

  // Load fonts from Google Fonts CDN
  const [regularFont, boldFont, monoFont] = await Promise.all([
    fetch('https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff').then(r => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7SUc.woff').then(r => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff').then(r => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#e8e8e2',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'JetBrains Mono',
        },
        children: [
          // Nav
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 48px',
                height: '60px',
                borderBottom: '1px solid rgba(0,0,0,0.12)',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '32px', height: '32px',
                      background: '#111110',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#c8ff00',
                      fontSize: '16px',
                    },
                    children: '⊘'
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '12px', letterSpacing: '3px', color: '#666660', fontFamily: 'Inter' },
                    children: 'MEV CHECKER'
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '11px', color: '#99998f', fontFamily: 'Inter' },
                    children: 'mev-checker.xyz'
                  }
                },
              ]
            }
          },

          // Content
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                padding: '32px 48px 0',
                flex: 1,
              },
              children: [
                // Badge
                confirmed ? {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#c8ff00',
                      borderRadius: '4px',
                      padding: '4px 12px',
                      marginBottom: '12px',
                      width: 'fit-content',
                      fontSize: '11px',
                      fontFamily: 'Inter Bold',
                      letterSpacing: '2px',
                      color: '#111110',
                    },
                    children: '● SANDWICH ATTACKS CONFIRMED'
                  }
                } : { type: 'div', props: { style: { display: 'none' }, children: '' } },

                // Label
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '12px', letterSpacing: '3px', color: '#666660', marginBottom: '8px', fontFamily: 'Inter' },
                    children: '// ESTIMATED MEV LOSSES — LAST 1 YEAR'
                  }
                },

                // Big number
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      marginBottom: '16px',
                    },
                    children: [{
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '110px',
                          fontFamily: 'Inter Bold',
                          letterSpacing: '-4px',
                          lineHeight: 1,
                          color: '#111110',
                          background: '#c8ff00',
                          padding: '4px 12px',
                        },
                        children: loss
                      }
                    }]
                  }
                },

                // Stats
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      gap: '1px',
                      background: 'rgba(0,0,0,0.1)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      marginBottom: '8px',
                    },
                    children: [
                      ['DEX TRADES', trades, '1 year'],
                      ['DEX VOLUME', volume, 'multichain'],
                      ['SANDWICHES', incidents, confirmed ? 'confirmed' : 'none found'],
                      ['VOL. SANDWICHED', sandwichVol, 'exposed'],
                    ].map(([label, val, sub]) => ({
                      type: 'div',
                      props: {
                        style: {
                          flex: 1,
                          background: '#f0f0ea',
                          padding: '14px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        },
                        children: [
                          { type: 'div', props: { style: { fontSize: '10px', letterSpacing: '1px', color: '#99998f', fontFamily: 'Inter' }, children: label } },
                          { type: 'div', props: { style: { fontSize: '24px', fontFamily: 'Inter Bold', color: '#111110' }, children: val } },
                          { type: 'div', props: { style: { fontSize: '10px', color: '#99998f', fontFamily: 'Inter' }, children: sub } },
                        ]
                      }
                    }))
                  }
                },

                // CTA
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#111110',
                      borderRadius: '6px',
                      padding: '14px 20px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', flexDirection: 'column', gap: '4px' },
                          children: [
                            { type: 'div', props: { style: { fontSize: '14px', fontFamily: 'Inter Bold', color: '#fff' }, children: 'Stop losing to MEV bots.' } },
                            { type: 'div', props: { style: { fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter' }, children: 'Privana routes your trades through private mempools.' } },
                          ]
                        }
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            background: '#c8ff00',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            fontSize: '12px',
                            fontFamily: 'Inter Bold',
                            color: '#111110',
                          },
                          children: 'Try Privana →'
                        }
                      }
                    ]
                  }
                }
              ].filter(Boolean)
            }
          }
        ]
      }
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: regularFont, style: 'normal', weight: 400 },
        { name: 'Inter Bold', data: boldFont, style: 'normal', weight: 700 },
        { name: 'JetBrains Mono', data: monoFont, style: 'normal', weight: 400 },
      ],
    }
  );
}
