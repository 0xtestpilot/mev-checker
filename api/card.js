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

            // Nav
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 56px',
                  height: '60px',
                  borderBottom: '1px solid rgba(26,26,26,0.1)',
                },
                children: [
                  { type: 'div', props: { style: { display: 'flex', fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }, children: 'MEV Checker' } },
                  { type: 'div', props: { style: { display: 'flex', fontSize: '13px', color: '#7a7570' }, children: 'mev-checker.xyz' } },
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
                  padding: '44px 56px 32px',
                  flex: 1,
                },
                children: [

                  // Label
                  { type: 'div', props: { style: { display: 'flex', fontSize: '13px', color: '#7a7570', letterSpacing: '0.3px', marginBottom: '14px' }, children: 'Estimated MEV loss · past 12 months' } },

                  // Loss card — white, yellow left rail
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        background: 'white',
                        border: '1.5px solid #1a1a1a',
                        borderLeft: '7px solid #e8c547',
                        borderRadius: '6px',
                        padding: '22px 32px',
                        marginBottom: '16px',
                        gap: '32px',
                      },
                      children: [
                        // Big number
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', fontSize: '112px', fontWeight: 700, letterSpacing: '-4px', lineHeight: '1', color: '#1a1a1a' },
                            children: loss
                          }
                        },
                        // Incidents
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', flexDirection: 'column', marginLeft: 'auto', alignItems: 'center', background: '#f0ede4', borderRadius: '4px', padding: '12px 24px' },
                            children: [
                              { type: 'div', props: { style: { display: 'flex', fontSize: '36px', fontWeight: 700, color: '#1a1a1a', lineHeight: '1' }, children: incidents } },
                              { type: 'div', props: { style: { display: 'flex', fontSize: '11px', color: '#7a7570', letterSpacing: '1px', marginTop: '4px' }, children: 'incidents' } },
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
                      style: { display: 'flex', gap: '12px', marginBottom: '16px' },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { flex: 1, background: 'white', border: '1px solid rgba(26,26,26,0.1)', borderRadius: '5px', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '4px' },
                            children: [
                              { type: 'div', props: { style: { display: 'flex', fontSize: '11px', color: '#7a7570', letterSpacing: '1px' }, children: 'DEX trades' } },
                              { type: 'div', props: { style: { display: 'flex', fontSize: '26px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px' }, children: trades } },
                            ]
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: { flex: 1, background: 'white', border: '1px solid rgba(26,26,26,0.1)', borderRadius: '5px', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '4px' },
                            children: [
                              { type: 'div', props: { style: { display: 'flex', fontSize: '11px', color: '#7a7570', letterSpacing: '1px' }, children: 'Volume scanned' } },
                              { type: 'div', props: { style: { display: 'flex', fontSize: '26px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px' }, children: volume } },
                            ]
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: { flex: 1, background: 'white', border: '1px solid rgba(26,26,26,0.1)', borderRadius: '5px', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '4px' },
                            children: [
                              { type: 'div', props: { style: { display: 'flex', fontSize: '11px', color: '#7a7570', letterSpacing: '1px' }, children: 'MEV rate' } },
                              { type: 'div', props: { style: { display: 'flex', fontSize: '26px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px' }, children: '1.25%' } },
                            ]
                          }
                        },
                      ]
                    }
                  },

                  // CTA strip
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', borderRadius: '6px', padding: '18px 28px' },
                      children: [
                        { type: 'div', props: { style: { display: 'flex', fontSize: '20px', fontWeight: 700, color: 'white', letterSpacing: '-0.3px' }, children: 'Stop losing to MEV bots.' } },
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', background: '#e8c547', borderRadius: '4px', padding: '12px 22px', fontSize: '15px', fontWeight: 700, color: '#1a1a1a' },
                            children: 'Try Privana  ->  privana.finance'
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
