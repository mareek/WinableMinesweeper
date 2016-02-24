using Windows.Foundation.Collections;
using Windows.Storage;

namespace WinableMinesweeper
{
    public class HighScores
    {
        private const string HighScorePrefix = "HighScore_";

        private static IPropertySet SettingValues => ApplicationData.Current.RoamingSettings.Values;

        public static int? GetHighScore(Dificulty dificulty) => (int?)SettingValues[HighScorePrefix + dificulty];

        public static void SetHighScore(Dificulty dificulty, int secondes) => SettingValues[HighScorePrefix + dificulty] = secondes;
    }
}
