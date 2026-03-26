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
          fontFamily: '"Courier New", monospace',
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
                    style: { fontSize: '12px', letterSpacing: '3px', color: '#666660' },
                    children: 'MEV CHECKER'
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '11px', color: '#99998f' },
                    children: 'mev-checker.vercel.app'
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
                      fontWeight: 'bold',
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
                    style: { fontSize: '12px', letterSpacing: '3px', color: '#666660', marginBottom: '8px' },
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
                          fontWeight: 'bold',
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
                          { type: 'div', props: { style: { fontSize: '10px', letterSpacing: '1px', color: '#99998f' }, children: label } },
                          { type: 'div', props: { style: { fontSize: '24px', fontWeight: 'bold', color: '#111110' }, children: val } },
                          { type: 'div', props: { style: { fontSize: '10px', color: '#99998f' }, children: sub } },
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
                            { type: 'div', props: { style: { fontSize: '14px', fontWeight: 'bold', color: '#fff' }, children: 'Stop losing to MEV bots.' } },
                            { type: 'div', props: { style: { fontSize: '11px', color: 'rgba(255,255,255,0.45)' }, children: 'Privana routes your trades through private mempools.' } },
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
                            fontWeight: 'bold',
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
    { width: 1200, height: 630 }
  );
}
