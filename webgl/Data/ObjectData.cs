using System;
using System.Collections.Generic;

using Newtonsoft.Json;

namespace webgl.Data
{
    public class ObjectData
    {
        public enum DataTypeEnum
        {
            Coordinates = 1,
            Normals = 2,
            Texture = 3,
        }

        public enum BufferTypeEnum
        {
            LineStrip = 1,
            Lines = 2,
            Triangles = 3,
            TriangleStrip = 4
        }

        public class Type
        {
            [JsonProperty(PropertyName = "dataType")]
            public DataTypeEnum DataType { get; set; }
            [JsonProperty(PropertyName = "size")]
            public int Size { get; set; }
            [JsonProperty(PropertyName = "tag")]
            public string Tag { get; set; }
        }

        public class Buffer
        {
            [JsonProperty(PropertyName = "bufferType")]
            public BufferTypeEnum BufferType { get; set; }
            [JsonProperty(PropertyName = "size")]
            public int Size { get; set; }
        }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }
        [JsonProperty(PropertyName = "types")]
        public IEnumerable<Type> Types { get; set; }
        [JsonProperty(PropertyName = "buffers")]
        public IEnumerable<Buffer> Buffers { get; set; }
        [JsonProperty(PropertyName = "vertices")]
        [JsonConverter(typeof(Helpers.JsonFloatConverter))]
        public IEnumerable<float> Vertices { get; set; }
        [JsonProperty(PropertyName = "triangles")]
        public IEnumerable<int> Triangles { get; set; }
    }
}
