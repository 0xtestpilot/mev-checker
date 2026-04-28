import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const loss = searchParams.get('loss') || '$0';
    const trades = searchParams.get('trades') || '0';
    const volume = searchParams.get('volume') || '$0';
    const incidents = searchParams.get('incidents') || '0';
    const confirmed = searchParams.get('confirmed') === '1';

    const [regularFont, boldFont] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf').then(r => {
        if (!r.ok) throw new Error(`Font fetch failed: ${r.status}`);
        return r.arrayBuffer();
      }),
      fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf').then(r => {
        if (!r.ok) throw new Error(`Font fetch failed: ${r.status}`);
        return r.arrayBuffer();
      }),
    ]);

    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            width: '1200px',
            height: '630px',
            background: '#f5f2ea',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter',
            position: 'relative',
          },
          children: [

            // Nav bar
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 56px',
                  height: '64px',
                  borderBottom: '1px solid rgba(26,26,26,0.12)',
                },
                children: [
                  // Logo + wordmark
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', alignItems: 'center', gap: '10px' },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              width: '30px', height: '30px',
                              background: '#1a1a1a',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            },
                            children: [{
                              type: 'div',
                              props: {
                                style: {
                                  width: '18px', height: '2px',
                                  background: '#e8c547',
                                  borderRadius: '1px',
                                },
                              }
                            }]
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.2px' },
                            children: 'MEV Checker'
                          }
                        }
                      ]
                    }
                  },
                  // URL
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '12px', color: '#7a7570', letterSpacing: '0.5px' },
                      children: 'mev-checker.xyz'
                    }
                  }
                ]
              }
            },

            // Main content
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '40px 56px 32px',
                  flex: 1,
                  gap: '0px',
                },
                children: [

                  // Label
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        fontSize: '11px',
                        letterSpacing: '2px',
                        color: '#7a7570',
                        textTransform: 'uppercase',
                        marginBottom: '12px',
                      },
                      children: 'Estimated MEV loss · past 12 months'
                    }
                  },

                  // Loss card with yellow left rail
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        background: 'white',
                        border: '1.5px solid #1a1a1a',
                        borderLeft: '6px solid #e8c547',
                        borderRadius: '6px',
                        padding: '20px 28px',
                        marginBottom: '20px',
                        gap: '24px',
                      },
                      children: [
                        // Big number
                        {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              fontSize: '96px',
                              fontWeight: 700,
                              letterSpacing: '-4px',
                              lineHeight: '1',
                              color: '#1a1a1a',
                            },
                            children: loss
                          }
                        },
                        // Incidents badge
                        {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              background: '#ece8dc',
                              borderRadius: '4px',
                              padding: '12px 20px',
                              marginLeft: 'auto',
                            },
                            children: [
                              {
                                type: 'div',
                                props: {
                                  style: { display: 'flex', fontSize: '32px', fontWeight: 700, color: '#1a1a1a' },
                                  children: incidents
                                }
                              },
                              {
                                type: 'div',
                                props: {
                                  style: { display: 'flex', fontSize: '10px', color: '#7a7570', letterSpacing: '1px', textTransform: 'uppercase' },
                                  children: 'incidents'
                                }
                              }
                            ]
                          }
                        }
                      ]
                    }
                  },

                  // Stats row
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '20px',
                      },
                      children: [
                        ['DEX Trades', trades, '1 year'],
                        ['Volume scanned', volume, 'multichain'],
                        ['MEV rate', '1.25%', 'of volume'],
                      ].map(([label, val, sub]) => ({
                        type: 'div',
                        props: {
                          style: {
                            flex: 1,
                            background: 'white',
                            border: '1px solid rgba(26,26,26,0.12)',
                            borderRadius: '5px',
                            padding: '14px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          },
                          children: [
                            { type: 'div', props: { style: { display: 'flex', fontSize: '10px', letterSpacing: '1.5px', color: '#7a7570', textTransform: 'uppercase' }, children: label } },
                            { type: 'div', props: { style: { display: 'flex', fontSize: '22px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px' }, children: val } },
                            { type: 'div', props: { style: { display: 'flex', fontSize: '10px', color: '#7a7570' }, children: sub } },
                          ]
                        }
                      }))
                    }
                  },

                  // Privana CTA strip
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#1a1a1a',
                        borderRadius: '6px',
                        padding: '16px 24px',
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', fontSize: '16px', fontWeight: 400, color: 'white', letterSpacing: '-0.2px' },
                            children: 'Stop losing to MEV bots.'
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              background: '#e8c547',
                              borderRadius: '4px',
                              padding: '10px 20px',
                              fontSize: '13px',
                              fontWeight: 700,
                              color: '#1a1a1a',
                            },
                            children: 'Try Privana -> privana.finance'
                          }
                        }
                      ]
                    }
                  }

                ]
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
          { name: 'Inter', data: boldFont, style: 'normal', weight: 700 },
        ],
      }
    );
  } catch (err) {
    return new Response(`Card generation failed: ${err.message}\n${err.stack}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
