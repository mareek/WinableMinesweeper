using Windows.Foundation.Collections;
using Windows.Storage;

namespace WinableMinesweeper
{
    public class Settings
    {
        private const string FlagModeSetting = "FlagMode";

        private static IPropertySet SettingValues => ApplicationData.Current.RoamingSettings.Values;

        public static bool FlagMode
        {
            get { return (bool?)SettingValues[FlagModeSetting] ?? false; }
            set { SettingValues[FlagModeSetting] = value; }
        }
    }
}
