using System;
using System.Collections.Generic;

namespace webgl.Handlers
{
    public class Geometry
    {
        public static Data.ObjectData GetSphere(int columns, int rows)
        {
            var vertices = new float[(2 + (rows - 1) * (columns + 1)) * 8];

            var step_row_angle = Math.PI / rows;
            var step_row_text = 1.0 / rows;
            var step_col_angle = 2 * Math.PI / columns;
            var step_col_text = 1.0 / columns;

            var cur_pos = 0;
            var cur_row_angle = step_row_angle;
            var cur_row_text = step_row_text;

            vertices[cur_pos + 0] = 0.0f;
            vertices[cur_pos + 1] = 1.0f;
            vertices[cur_pos + 2] = 0.0f;
            vertices[cur_pos + 3] = 0.0f;
            vertices[cur_pos + 4] = 1.0f;
            vertices[cur_pos + 5] = 0.0f;
            vertices[cur_pos + 6] = 0.5f;
            vertices[cur_pos + 7] = 0.0f;
            cur_pos += 8;
            for (var i = 0; i < rows - 1; i++) {
                var cur_row_sin = Math.Sin(cur_row_angle);
                var cur_row_cos = Math.Cos(cur_row_angle);

                var cur_col_angle = 0.0;
                var cur_col_text = 0.0;
                for (var j = 0; j <= columns; j++) {
                    var cur_col_sin = Math.Sin(cur_col_angle);
                    var cur_col_cos = Math.Cos(cur_col_angle);

                    vertices[cur_pos + 0] = (float)(cur_col_sin * cur_row_sin);
                    vertices[cur_pos + 1] = (float)(cur_row_cos);
                    vertices[cur_pos + 2] = (float)(cur_col_cos * cur_row_sin);
                    //var length = Math.Sqrt((vertices[cur_pos + 0] * vertices[cur_pos + 0]) + (vertices[cur_pos + 1] * vertices[cur_pos + 1]) + (vertices[cur_pos + 2] * vertices[cur_pos + 2]));
                    vertices[cur_pos + 3] = vertices[cur_pos + 0];
                    vertices[cur_pos + 4] = vertices[cur_pos + 1];
                    vertices[cur_pos + 5] = vertices[cur_pos + 2];
                    vertices[cur_pos + 6] = (float)(cur_col_text);
                    vertices[cur_pos + 7] = (float)(cur_row_text);
                    cur_pos += 8;

                    cur_col_angle += step_col_angle;
                    cur_col_text += step_col_text;
                }
                cur_row_angle += step_row_angle;
                cur_row_text += step_row_text;
            }
            vertices[cur_pos + 0] = 0.0f;
            vertices[cur_pos + 1] = -1.0f;
            vertices[cur_pos + 2] = 0.0f;
            vertices[cur_pos + 3] = 0.0f;
            vertices[cur_pos + 4] = -1.0f;
            vertices[cur_pos + 5] = 0.0f;
            vertices[cur_pos + 6] = 0.5f;
            vertices[cur_pos + 7] = 1.0f;
            cur_pos += 8;

            var triangles = new int[(2 * columns * (rows - 1) * 3)];
            cur_pos = 0;
            for (var i = 0; i < columns; i++) {
                triangles[cur_pos + 0] = 0;
                triangles[cur_pos + 1] = i + 1;
                triangles[cur_pos + 2] = i + 2;
                cur_pos += 3;
            }
            var row_cur = 1;
            var row_next = row_cur + (columns + 1);
            for (var i = 0; i < rows - 2; i++) {
                for (var j = 0; j < columns; j++) {
                    triangles[cur_pos + 0] = row_cur + j;
                    triangles[cur_pos + 1] = row_next + j;
                    triangles[cur_pos + 2] = row_next + j + 1;
                    cur_pos += 3;
                }
                for (var j = 0; j < columns; j++) {
                    triangles[cur_pos + 0] = row_cur + j;
                    triangles[cur_pos + 1] = row_cur + j + 1;
                    triangles[cur_pos + 2] = row_next + j + 1;
                    cur_pos += 3;
                }
                row_cur = row_next;
                row_next += (columns + 1);
            }
            for (var i = 0; i < columns; i++) {
                triangles[cur_pos + 0] = row_cur + i;
                triangles[cur_pos + 1] = row_cur + i + 1;
                triangles[cur_pos + 2] = row_next;
                cur_pos += 3;
            }

            Data.ObjectData od = new Data.ObjectData
            {
                Name = "Sphere",
                Types = new List<Data.ObjectData.Type>() {
                    new Data.ObjectData.Type {
                        DataType = Data.ObjectData.DataTypeEnum.Coordinates,
                        Size = 12
                    },
                    new Data.ObjectData.Type {
                        DataType = Data.ObjectData.DataTypeEnum.Normals,
                        Size = 12
                    },
                    new Data.ObjectData.Type {
                        DataType = Data.ObjectData.DataTypeEnum.Texture,
                        Size = 8,
                        Tag = "Content/img/earth.jpg"
                    }
                },
                Buffers = new List<Data.ObjectData.Buffer>() {
                    new Data.ObjectData.Buffer() {
                        BufferType = Data.ObjectData.BufferTypeEnum.TriangleStrip, Size = 2 * columns * (rows - 1) * 3
                    }
                },
                Vertices = vertices,
                Triangles = triangles
            };
            return od;
        }
    }
}
