using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WinableMinesweeper
{
    public struct MineCell
    {
        public int Row { get; }

        public int Col { get; }

        public bool HasMine { get; set; }

        public bool HasFlag { get; set; }

        public MineCell(int row, int col)
            :this()
        {
            Row = row;
            Col = col;
        }
    }
}
