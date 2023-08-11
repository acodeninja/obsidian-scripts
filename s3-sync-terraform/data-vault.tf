provider "aws" {}

resource "aws_s3_bucket" "data_vault" {
  bucket_prefix = "obsidian-data-vault-"
}

resource "aws_s3_bucket_public_access_block" "data_vault" {
  bucket = aws_s3_bucket.data_vault.bucket
  block_public_acls = true
}

resource "aws_iam_user" "data_vault" {
  name = "data-vault-user"
}

data "aws_iam_policy_document" "data_vault_access" {

}

resource "aws_iam_access_key" "data_vault" {
  user = aws_iam_user.data_vault.name
}

output "aws_access_key_id" {
  value = aws_iam_access_key.data_vault.id
}

output "aws_access_key_secret" {
  value = aws_iam_access_key.data_vault.secret
}
