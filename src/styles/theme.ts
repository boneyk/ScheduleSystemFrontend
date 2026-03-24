import { createTheme } from '@mui/material/styles';

import { getNumberValue } from './utils';

import vars from './variables.module.scss';

declare module '@mui/material/styles' {
  interface Components {
    MuiPickersDay?: any;
    MuiPickersYear?: any;
    MuiPickersMonth?: any;
    MuiPickersCalendarHeader?: any;
    MuiClockPointer?: any;
    MuiClockNumber?: any;
    MuiClock?: any;
    MuiMultiSectionDigitalClock?: any;
    MuiDigitalClock?: any;
    MuiPickersLayout?: any;
    MuiPickersToolbar?: any;
    MuiDateTimePickerToolbar?: any;
    MuiDatePickerToolbar?: any;
    MuiTimePickerToolbar?: any;
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: vars.colorPrimary,
      light: vars.colorPrimaryLight,
      dark: vars.colorPrimaryDark,
      contrastText: vars.colorContrast
    },
    secondary: {
      main: vars.colorSecondaryMain,
      light: vars.colorSecondaryLight,
      dark: vars.colorSecondaryDark,
      contrastText: vars.colorContrast
    },
    error: {
      main: vars.colorError
    },
    success: {
      main: vars.colorSuccess
    },
    warning: {
      main: vars.colorWarning
    }
  },
  typography: {
    fontFamily: vars.fontPrimary,
    fontWeightRegular: vars.fontWeightRegular,
    fontWeightMedium: vars.fontWeightMedium,
    fontWeightBold: vars.fontWeightBold
  },
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginBottom: getNumberValue(vars.marginXS)
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: vars.fontFamily,
          fontWeight: vars.fontWeightRegular,
          padding: '8px 16px',
          backgroundColor: vars.colorSecondaryLight,
          color: vars.colorWhite,
          border: 'none',
          minHeight: 0,
          minWidth: 0,
          '&:hover': {
            backgroundColor: vars.colorSecondaryMain
          },
          '&.Mui-focusVisible': {
            outline: `2px dashed ${vars.colorWhite}`,
            outlineOffset: 2
          },

          '&.Mui-disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
            pointerEvents: 'none'
          }
        },

        contained: {
          cursor: 'pointer',
          fontWeight: 'bold',
          fontFamily: 'var(--font-family-base), sans-serif',
          border: 'none',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition:
            'background-color var(--transition-base), color var(--transition-base), transform var(--transition-base)',
          boxShadow: 'none !important',
          boxSizing: 'border-box',
          '&:active': {
            transform: 'scale(0.95)'
          }
        },
        containedPrimary: {
          color: 'var(--color-white)',
          backgroundColor: vars.colorSecondaryLight,
          '&:hover': {
            backgroundColor: vars.colorSecondaryMain
          }
        },
        containedSecondary: {
          color: 'var(--color-black)',
          backgroundColor: vars.colorNeutral,
          '&:hover': {
            backgroundColor: vars.colorHoverNeutral
          }
        },

        outlined: {
          backgroundColor: 'var(--color-white)',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxSizing: 'border-box',
          fontSize: vars.monthSwitcherFontSize,
          fontWeight: 'bold',
          fontFamily: 'var(--font-family-base), sans-serif',
          transition:
            'border-color var(--transition-base), color var(--transition-base), background-color var(--transition-base)'
        },
        outlinedPrimary: {
          border: 'solid var(--color-pointer) var(--border-width-thin)',
          '&:hover': {
            backgroundColor: 'var(--color-white)',
            borderColor: vars.colorSecondaryMain,
            boxShadow: 'none'
          }
        },
        outlinedSecondary: {
          border: 'solid var(--color-gray-400) var(--border-width-thin)',
          '&:hover': {
            backgroundColor: 'var(--color-gray-100)',
            borderColor: vars.colorHoverNeutral,
            boxShadow: 'none'
          }
        },
        text: {
          background: 'none',
          fontFamily: 'var(--font-family-base), sans-serif',
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'color var(--transition-base), transform var(--transition-base)',
          boxSizing: 'border-box',
          padding: 0,
          margin: 0,
          minHeight: 0,
          minWidth: 0
        },
        textSecondary: {
          color: 'rgba(0, 0, 0, 0.7)',
          '&:hover': {
            color: 'rgba(0, 0, 0, 1)',
            background: 'none'
          },
          '&:active': {
            transform: 'scale(0.95)'
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          boxSizing: 'border-box',

          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: vars.colorHoverNeutral
          },

          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: vars.colorSecondaryLight
          },

          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: vars.colorSecondaryLight,
            borderWidth: 2
          },

          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-error)'
          },

          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            opacity: 0.5,
            cursor: 'not-allowed',
            pointerEvents: 'none'
          }
        },
        input: {
          fontFamily: 'var(--font-family-base), sans-serif'
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: vars.colorHoverNeutral,

          '.Mui-focused &': {
            color: vars.colorSecondaryLight
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',

          color: vars.colorHoverNeutral,
          fontSize: 14,
          fontWeight: 600,

          '&.Mui-focused': {
            color: vars.colorSecondaryLight
          },

          '&.Mui-error': {
            color: vars.colorError
          },

          '&.Mui-disabled': {
            color: 'rgba(0,0,0,0.38)'
          }
        },
        shrink: {
          left: -2
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',

          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 115, 50, 0.2)',
            fontWeight: 600
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(255, 115, 50, 0.2)',
            fontWeight: 600
          },
          '&.Mui-focusVisible': {
            backgroundColor: 'rgba(255, 115, 50, 0.2)'
          },
          '&.Mui-selected.Mui-focusVisible': {
            backgroundColor: 'rgba(255, 115, 50, 0.2)'
          }
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          maxHeight: 300,
          overflowY: 'auto',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        },
        list: {
          paddingTop: 0,
          paddingBottom: 0
        }
      }
    },
    MuiTable: {
      styleOverrides: {
        root: {
          tableLayout: 'fixed',
          width: '100%'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',
          boxSizing: 'border-box',
          borderBottom: 'solid 1px var(--color-neutral-60)',
          borderRight: 'solid 1px var(--color-neutral-60)',
          padding: 0
        },

        head: {
          fontWeight: 600
        },

        stickyHeader: {
          zIndex: 6,
          backgroundColor: 'var(--color-white)'
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: vars.monthSwitcherBorderRadius,
          border: 'solid 1px var(--color-neutral-60)',
          boxSizing: 'border-box'
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }
      }
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: 'var(--color-pointer)'
        }
      }
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',
          '&::first-letter': {
            textTransform: 'uppercase'
          }
        }
      }
    },
    MuiPopper: {
      styleOverrides: {
        root: {
          '&.MuiPickersPopper-root': {
            fontFamily: 'var(--font-family-base), sans-serif',
            textTransform: 'capitalize',
            '& *': {
              fontFamily: 'var(--font-family-base), sans-serif !important'
            }
          }
        }
      }
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',
          backgroundColor: 'transparent',
          '&.Mui-selected': {
            backgroundColor: 'var(--color-pointer)',
            color: 'var(--color-white)',
            '&:hover': {
              backgroundColor: 'var(--color-pointer)',
              opacity: 0.9
            },
            '&:focus': {
              backgroundColor: 'var(--color-pointer)'
            },
            '&.MuiPickersDay-today': {
              backgroundColor: 'var(--color-pointer)',
              color: 'var(--color-white)',
              border: '1px solid var(--color-pointer)'
            }
          },
          '&.MuiPickersDay-today': {
            border: '1px solid var(--color-pointer)',
            backgroundColor: 'transparent',
            '&:not(.Mui-selected)': {
              borderColor: 'var(--color-pointer)',
              backgroundColor: 'transparent'
            }
          }
        }
      }
    },
    MuiPickersYear: {
      styleOverrides: {
        yearButton: {
          fontFamily: 'var(--font-family-base), sans-serif !important',
          backgroundColor: 'transparent',
          '&.Mui-selected': {
            backgroundColor: 'var(--color-pointer)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-family-base), sans-serif',
            '&:hover': {
              backgroundColor: 'var(--color-pointer)',
              opacity: 0.9
            },
            '&:focus': {
              backgroundColor: 'var(--color-pointer)'
            }
          }
        }
      }
    },
    MuiPickersMonth: {
      styleOverrides: {
        monthButton: {
          fontFamily: 'var(--font-family-base), sans-serif !important',
          backgroundColor: 'transparent',
          '&.Mui-selected': {
            backgroundColor: 'var(--color-pointer)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-family-base), sans-serif',
            '&:hover': {
              backgroundColor: 'var(--color-pointer)',
              opacity: 0.9
            },
            '&:focus': {
              backgroundColor: 'var(--color-pointer)'
            }
          }
        }
      }
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        switchViewButton: {
          backgroundColor: 'transparent',
          color: 'var(--color-pointer)',
          '&:hover': {
            backgroundColor: 'rgba(255, 115, 50, 0.1)'
          }
        },
        label: {
          fontFamily: 'var(--font-family-base), sans-serif',
          textTransform: 'capitalize'
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&.MuiPickersArrowSwitcher-button': {
            backgroundColor: 'transparent',
            color: 'var(--color-pointer)',
            '&:hover': {
              backgroundColor: 'rgba(255, 115, 50, 0.1)'
            }
          }
        }
      }
    },
    MuiClockPointer: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--color-pointer)'
        },
        thumb: {
          backgroundColor: 'var(--color-pointer)',
          borderColor: 'var(--color-pointer)'
        }
      }
    },
    MuiClockNumber: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif !important',
          '&.Mui-selected': {
            backgroundColor: 'var(--color-pointer)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-family-base), sans-serif'
          }
        }
      }
    },
    MuiClock: {
      styleOverrides: {
        pin: {
          backgroundColor: 'var(--color-pointer)'
        }
      }
    },
    MuiMultiSectionDigitalClock: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',
          '& *': {
            fontFamily: 'var(--font-family-base), sans-serif !important'
          },
          '& .MuiMenuItem-root': {
            fontFamily: 'var(--font-family-base), sans-serif'
          },
          '& .MuiMenuItem-root.Mui-selected': {
            backgroundColor: 'var(--color-pointer)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-family-base), sans-serif',
            '&:hover': {
              backgroundColor: 'var(--color-pointer)',
              opacity: 0.9
            }
          }
        }
      }
    },
    MuiDigitalClock: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',
          '& *': {
            fontFamily: 'var(--font-family-base), sans-serif !important'
          },
          '& .MuiMenuItem-root': {
            fontFamily: 'var(--font-family-base), sans-serif'
          },
          '& .MuiMenuItem-root.Mui-selected': {
            backgroundColor: 'var(--color-pointer)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-family-base), sans-serif',
            '&:hover': {
              backgroundColor: 'var(--color-pointer)',
              opacity: 0.9
            }
          }
        }
      }
    },
    MuiPickersLayout: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',
          '& *': {
            fontFamily: 'var(--font-family-base), sans-serif !important'
          },
          '& .MuiPickersLayout-actionBar': {
            '& .MuiButton-root': {
              backgroundColor: 'transparent',
              fontFamily: 'var(--font-family-base), sans-serif'
            }
          },
          '& .MuiTabs-root': {
            '& .MuiTab-root': {
              fontFamily: 'var(--font-family-base), sans-serif'
            },
            '& .MuiTab-root.Mui-selected': {
              color: 'var(--color-pointer)'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--color-pointer)'
            }
          }
        }
      }
    },
    MuiPickersToolbar: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',
          '& *': {
            fontFamily: 'var(--font-family-base), sans-serif !important'
          },
          '& .MuiTypography-overline': {
            display: 'none'
          },
          '& .MuiPickersToolbar-content': {
            '& button': {
              backgroundColor: 'transparent',
              color: 'var(--color-black)',
              fontFamily: 'var(--font-family-base), sans-serif',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              },
              '&.Mui-selected': {
                color: 'var(--color-pointer)',
                backgroundColor: 'transparent'
              }
            }
          }
        }
      }
    },
    MuiDateTimePickerToolbar: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',
          '& *': {
            fontFamily: 'var(--font-family-base), sans-serif !important'
          },
          '& .MuiTypography-overline': {
            display: 'none'
          },
          '& .MuiSvgIcon-root': {
            color: 'var(--color-black)'
          },
          '& .MuiTypography-root': {
            textTransform: 'capitalize',
            fontFamily: 'var(--font-family-base), sans-serif'
          }
        },
        dateContainer: {
          textTransform: 'capitalize',
          '& button': {
            backgroundColor: 'transparent',
            color: 'var(--color-black)',
            textTransform: 'capitalize',
            fontFamily: 'var(--font-family-base), sans-serif',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            },
            '&.Mui-selected': {
              color: 'var(--color-pointer)',
              backgroundColor: 'transparent'
            }
          },
          '& .MuiTypography-root': {
            textTransform: 'capitalize',
            fontFamily: 'var(--font-family-base), sans-serif'
          },
          '& *': {
            textTransform: 'capitalize',
            fontFamily: 'var(--font-family-base), sans-serif'
          }
        },
        timeContainer: {
          '& button': {
            backgroundColor: 'transparent',
            color: 'var(--color-black)',
            fontFamily: 'var(--font-family-base), sans-serif',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            },
            '&.Mui-selected': {
              color: 'var(--color-pointer)',
              backgroundColor: 'transparent'
            }
          }
        }
      }
    },
    MuiDatePickerToolbar: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',
          '& *': {
            fontFamily: 'var(--font-family-base), sans-serif !important',
            textTransform: 'capitalize'
          },
          '& .MuiTypography-overline': {
            display: 'none'
          },
          '& .MuiSvgIcon-root': {
            color: 'var(--color-black)'
          },
          '& .MuiTypography-root': {
            textTransform: 'capitalize',
            fontFamily: 'var(--font-family-base), sans-serif'
          }
        }
      }
    },
    MuiTimePickerToolbar: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',
          '& *': {
            fontFamily: 'var(--font-family-base), sans-serif !important'
          },
          '& .MuiTypography-overline': {
            display: 'none'
          },
          '& .MuiSvgIcon-root': {
            color: 'var(--color-black)'
          }
        }
      }
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          '& .MuiIconButton-root': {
            color: 'rgba(0, 0, 0, 0.4)',
            '& .MuiSvgIcon-root': {
              color: 'rgba(0, 0, 0, 0.4)'
            }
          }
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        noOptions: {
          fontFamily: 'var(--font-family-base), sans-serif'
        },
        listbox: {
          fontFamily: 'var(--font-family-base), sans-serif',
          '& .MuiAutocomplete-option': {
            fontFamily: 'var(--font-family-base), sans-serif'
          }
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          overflow: 'visible'
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
          fontFamily: 'var(--font-family-base), sans-serif'
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '4px',
          boxSizing: 'border-box',
          fontFamily: 'var(--font-family-base), sans-serif'
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          minWidth: 0,
          overflow: 'visible',
          fontFamily: 'var(--font-family-base), sans-serif'
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',
          transition: 'background-color var(--transition-base), color var(--transition-base)',
          boxSizing: 'border-box'
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-family-base), sans-serif',
          '& .MuiAlert-message': {
            fontFamily: 'var(--font-family-base), sans-serif',
            '& .MuiTypography-root': {
              fontFamily: 'var(--font-family-base), sans-serif'
            }
          }
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: 'var(--font-family-base), sans-serif'
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        thumb: {
          backgroundColor: 'var(--color-pointer)'
        },
        track: {
          backgroundColor: 'var(--color-gray-300)',
          opacity: 1
        },
        switchBase: {
          '&.Mui-checked': {
            '& .MuiSwitch-thumb': {
              backgroundColor: 'var(--color-pointer)'
            },
            '& + .MuiSwitch-track': {
              backgroundColor: 'var(--color-pointer)',
              opacity: 0.5
            }
          }
        }
      }
    }
  }
});
