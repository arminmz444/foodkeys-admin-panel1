import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import { darken } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseHighlight from '@fuse/core/FuseHighlight';
import FuseLoading from '@fuse/core/FuseLoading';
import MiniAppFrame from './MiniAppFrame';

/**
 * EnhancedMiniAppViewer component
 * Displays a MiniApp with tabs for preview, HTML, CSS, and JS
 * Expects miniapp data via props (no backend API calls)
 */
function EnhancedMiniAppViewer(props) {
  const { miniapp: miniappProp, className } = props;
  const [currentTab, setCurrentTab] = useState(0);
  const [miniapp, setMiniapp] = useState(miniappProp || null);
  const [loading, setLoading] = useState(!miniappProp);
  const [error, setError] = useState(null);
  const [content, setContent] = useState({ html: '', css: '', js: '' });

  useEffect(() => {
    if (!miniappProp) {
      setMiniapp(null);
      setContent({ html: '', css: '', js: '' });
      setError('MiniApp data must be provided');
      setLoading(false);
      return;
    }

    setMiniapp(miniappProp);
    setContent({
      html: miniappProp.content?.html || '',
      css: miniappProp.content?.css || '',
      js: miniappProp.content?.js || ''
    });
    setError(null);
    setLoading(false);
  }, [miniappProp]);

  const handleChange = (event, value) => {
    setCurrentTab(value);
  };

  if (loading) {
    return <FuseLoading />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h5">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!miniapp) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary" variant="h5">
          No MiniApp found
        </Typography>
      </Box>
    );
  }

  const getIframeContent = () => {
    if (miniapp.integrationType === 'iframe') {
      return miniapp.iframeSrc || miniapp.renderUrl || '';
    }

    return `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${miniapp.name}</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>${content.css}</style>
</head>
<body>
  ${content.html}
  <script>
    ${content.js}
  </script>
</body>
</html>
      `;
  };

  return (
    <Card className={className} sx={{ backgroundColor: (theme) => darken(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.02 : 0.2) }}>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        classes={{
          root: 'border-b-1',
        }}
      >
        <Tab
          classes={{
            root: 'min-w-128',
          }}
          label="پیش‌نمایش"
          icon={<FuseSvgIcon>heroicons-outline:eye</FuseSvgIcon>}
        />
        <Tab
          classes={{
            root: 'min-w-128',
          }}
          label="HTML"
          icon={<FuseSvgIcon>heroicons-outline:code</FuseSvgIcon>}
        />
        <Tab
          classes={{
            root: 'min-w-128',
          }}
          label="CSS"
          icon={<FuseSvgIcon>heroicons-outline:document-text</FuseSvgIcon>}
        />
        <Tab
          classes={{
            root: 'min-w-128',
          }}
          label="JavaScript"
          icon={<FuseSvgIcon>heroicons-outline:cog</FuseSvgIcon>}
        />
      </Tabs>

      <Box sx={{ position: 'relative' }}>
        {currentTab === 0 && (
          <Box
            sx={{
              opacity: 1,
              display: 'flex',
              position: 'relative',
              flexDirection: 'column',
              minHeight: 400,
            }}
          >
            {miniapp.integrationType === 'iframe' && getIframeContent() ? (
              <MiniAppFrame name={miniapp.name} src={getIframeContent()} />
            ) : (
              <MiniAppFrame name={miniapp.name}>
                <div dangerouslySetInnerHTML={{ __html: content.html }} />
              </MiniAppFrame>
            )}
          </Box>
        )}

        {currentTab === 1 && (
          <div className="flex flex-1 justify-center px-16 py-24">
            <FuseHighlight component="pre" className="language-html w-full">
              {content.html}
            </FuseHighlight>
          </div>
        )}

        {currentTab === 2 && (
          <div className="flex flex-1 justify-center px-16 py-24">
            <FuseHighlight component="pre" className="language-css w-full">
              {content.css}
            </FuseHighlight>
          </div>
        )}

        {currentTab === 3 && (
          <div className="flex flex-1 justify-center px-16 py-24">
            <FuseHighlight component="pre" className="language-js w-full">
              {content.js}
            </FuseHighlight>
          </div>
        )}
      </Box>
    </Card>
  );
}

export default EnhancedMiniAppViewer;
