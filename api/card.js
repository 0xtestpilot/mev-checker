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
          },
          children: [

            // Top strip — label + site
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 56px',
                  height: '56px',
                  borderBottom: '1px solid rgba(26,26,26,0.1)',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', fontSize: '13px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0px' },
                      children: 'MEV Checker'
                    }
                  },
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', fontSize: '13px', color: '#7a7570' },
                      children: 'mev-checker.xyz'
                    }
                  }
                ]
              }
            },

            // Middle — big number block
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '0 56px',
                  gap: '0px',
                },
                children: [
                  // Eyebrow
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        fontSize: '16px',
                        color: '#7a7570',
                        letterSpacing: '0.5px',
                        marginBottom: '8px',
                      },
                      children: 'Estimated MEV loss · past 12 months'
                    }
                  },

                  // THE NUMBER — huge, yellow highlight
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '20px',
                        marginBottom: '20px',
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              fontSize: '148px',
                              fontWeight: 700,
                              letterSpacing: '-6px',
                              lineHeight: '1',
                              color: '#1a1a1a',
                              background: '#e8c547',
                              padding: '2px 16px 6px',
                              borderRadius: '4px',
                            },
                            children: loss
                          }
                        },
                        // incidents pill
                        {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              paddingBottom: '8px',
                            },
                            children: [
                              {
                                type: 'div',
                                props: {
                                  style: { display: 'flex', fontSize: '48px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-2px', lineHeight: '1' },
                                  children: incidents
                                }
                              },
                              {
                                type: 'div',
                                props: {
                                  style: { display: 'flex', fontSize: '14px', color: '#7a7570', letterSpacing: '1px' },
                                  children: 'incidents'
                                }
                              }
                            ]
                          }
                        }
                      ]
                    }
                  },

                  // Sub stats — trades + volume inline
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        gap: '32px',
                        marginBottom: '0px',
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', gap: '6px', alignItems: 'baseline' },
                            children: [
                              { type: 'div', props: { style: { display: 'flex', fontSize: '22px', fontWeight: 700, color: '#1a1a1a' }, children: trades } },
                              { type: 'div', props: { style: { display: 'flex', fontSize: '14px', color: '#7a7570' }, children: 'trades scanned' } },
                            ]
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', gap: '6px', alignItems: 'baseline' },
                            children: [
                              { type: 'div', props: { style: { display: 'flex', fontSize: '22px', fontWeight: 700, color: '#1a1a1a' }, children: volume } },
                              { type: 'div', props: { style: { display: 'flex', fontSize: '14px', color: '#7a7570' }, children: 'volume · 3 chains' } },
                            ]
                          }
                        },
                      ]
                    }
                  },
                ]
              }
            },

            // Bottom CTA bar — full width, dark, punchy
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#1a1a1a',
                  padding: '0 56px',
                  height: '90px',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', fontSize: '26px', fontWeight: 700, color: 'white', letterSpacing: '-0.5px' },
                      children: 'Stop losing to MEV bots.'
                    }
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        background: '#e8c547',
                        borderRadius: '6px',
                        padding: '14px 28px',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#1a1a1a',
                        letterSpacing: '-0.3px',
                      },
                      children: 'Try Privana  privana.finance'
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
