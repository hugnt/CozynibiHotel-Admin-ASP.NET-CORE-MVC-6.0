namespace CozynibiHotel.Admin.Models
{
	public class ResponseModel
	{
		public int Status { get; set; }
		public string StatusMessage { get; set; }

		public Data Data { get; set; }

	}
	public class Data
	{
		public string AccessToken { get; set; }
		public string RefeshToken { get; set; }
	}
}
