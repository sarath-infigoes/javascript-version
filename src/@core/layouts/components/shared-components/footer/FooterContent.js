// ** MUI Imports
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

const FooterContent = () => {
  // ** Var
  const hidden = useMediaQuery(theme => theme.breakpoints.down('md'))

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
  <Typography component="span" sx={{ mr: 2 }}>
  {`© ${new Date().getFullYear()}, Made with `}
  <Box component='span' sx={{ color: 'error.main' }}>
    ❤️
  </Box>
  {` by `}
  <Link component="a" target='_blank' href=''>
    ThemeSelection
  </Link>
</Typography>
  {hidden ? null : (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& :not(:last-child)': { mr: 4 } }}>
      {/* Ensure each Link is not nested inside another <a> tag */}
      <Link component="a" target='_blank' href='https://themeselection.com/license'>
        MIT License
      </Link>
      <Link component="a" target='_blank' href='https://themeselection.com/themes'>
        More Themes
      </Link>
      <Link component="a" target='_blank' href='https://themeselection.com/docs'>
        Documentation
      </Link>
      <Link component="a" target='_blank' href='https://themeselection.com/support'>
        Support
      </Link>
    </Box>
  )}
</Box>
  )
}

export default FooterContent
