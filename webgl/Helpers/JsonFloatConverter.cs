using System;
using System.Collections.Generic;

using Newtonsoft.Json;

namespace webgl.Helpers
{
    public class JsonFloatConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(IEnumerable<float>);
        }

        public override bool CanRead
        {
            get
            {
                return false;
            }
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (value is IEnumerable<float>)
            {
                var vs = value as IEnumerable<float>;
                writer.WriteStartArray();
                foreach (var item in vs)
                {
                    writer.WriteRawValue(item.ToString("N4"));
                }
                writer.WriteEndArray();
            }
        }
    }
}
