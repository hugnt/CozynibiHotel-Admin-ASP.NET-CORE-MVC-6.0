namespace CozynibiHotel.Admin.Models
{
	public class Button
	{
		public string Content { get; set; }
		public string Color { get; set; }
		public string Click { get; set; }

		public Button(string content, string color, string click)
		{
			Content = content;
			Color = color;
			Click = click;
		}
	}
}
