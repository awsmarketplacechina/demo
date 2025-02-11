# alicloud_oss_bucket.default:
resource "alicloud_oss_bucket" "default" {
    acl               = "private"
    bucket            = "awsmp-demo-001"
    creation_date     = "2025-02-11"
    extranet_endpoint = "oss-cn-beijing.aliyuncs.com"
    id                = "awsmp-demo-001"
    intranet_endpoint = "oss-cn-beijing-internal.aliyuncs.com"
    location          = "oss-cn-beijing"
    owner             = "1186838991269606"
    policy            = null
    redundancy_type   = "LRS"
    resource_group_id = "rg-acfmwwtrazro5zq"
    storage_class     = "Standard"
    tags              = {}

    access_monitor {
        status = "Disabled"
    }
}
