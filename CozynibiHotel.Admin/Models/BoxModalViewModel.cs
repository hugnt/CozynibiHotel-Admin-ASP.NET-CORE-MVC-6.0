namespace CozynibiHotel.Admin.Models
{
	public class BoxModalViewModel
	{
		public string Id { get; set; }
		public string Title { get; set; }
		public string Text { get; set; }
		public List<Button> LstButton { get; set; }

        public string Icon { get; set; }

		public string IconColor { get; set; }
		public BoxModalViewModel()
		{
			LstButton = new List<Button>();
		}

	}

}
